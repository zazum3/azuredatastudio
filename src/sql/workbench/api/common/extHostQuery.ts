/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as protocol from 'sql/workbench/api/common/sqlExtHost.protocol';
import { RunOnceScheduler } from 'vs/base/common/async';
import { IURITransformer } from 'vs/base/common/uriIpc';
import { IMainContext } from 'vs/workbench/api/common/extHost.protocol';
import type * as azdata from 'azdata';
import type * as vscode from 'vscode';
import { URI } from 'vs/base/common/uri';
import { mapToSerializable } from 'sql/base/common/map';
import * as types from 'vs/workbench/api/common/extHostTypes';
import { IRange } from 'vs/editor/common/core/range';
import { isUndefined } from 'vs/base/common/types';
import { DisposableStore, combinedDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { values } from 'vs/base/common/collections';

export class ExtHostQuery implements protocol.ExtHostQueryShape {

	private static _handlePool: number = 0;
	private readonly proxy: protocol.MainThreadQueryShape;

	private readonly messageRunner = new RunOnceScheduler(() => this.sendMessages(), 1000);
	private readonly queuedMessages = new Map<number, Map<string, azdata.IResultMessage[]>>();
	private readonly providers = new Map<number, azdata.QueryProvider2>();

	private _nextHandle(): number {
		return ExtHostQuery._handlePool++;
	}

	constructor(
		mainContext: IMainContext,
		private readonly uriTransformer: IURITransformer | null
	) {
		this.proxy = mainContext.getProxy(protocol.SqlMainContext.MainThreadQuery);
	}

	async $cancel(handle: number, ownerUri: string): Promise<string> {
		return (await this._resolveProvider(handle).cancelQuery(ownerUri)).messages;
	}

	async $run(handle: number, ownerUri: string, range?: IRange, options?: protocol.IRunOptions): Promise<void> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformIncoming(URI.parse(ownerUri))).toString(true);
		}

		return this._resolveProvider(handle).runQuery(ownerUri, rangeToSelectionData(range), options);
	}

	$runStatement(handle: number, ownerUri: string, line: number, column: number): Promise<void> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformIncoming(URI.parse(ownerUri))).toString(true);
		}
		return Promise.resolve(this._resolveProvider(handle).runQueryStatement(ownerUri, line, column));
	}

	$runString(handle: number, ownerUri: string, queryString: string): Promise<void> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformIncoming(URI.parse(ownerUri))).toString(true);
		}
		return Promise.resolve(this._resolveProvider(handle).runQueryString(ownerUri, queryString));
	}

	$setExecutionOptions(handle: number, ownerUri: string, options: { [key: string]: number | boolean | string }): Promise<void> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformIncoming(URI.parse(ownerUri))).toString(true);
		}
		if (this._resolveProvider(handle).setQueryExecutionOptions) {
			return Promise.resolve(this._resolveProvider(handle).setQueryExecutionOptions(ownerUri, { options }));
		} else {
			return Promise.resolve();
		}
	}

	async $getRows(handle: number, params: protocol.IGetQueryRowsParams): Promise<protocol.IGetQueryRowsResponse> {
		let transformedId: string | undefined;
		if (this.uriTransformer) {
			transformedId = URI.from(this.uriTransformer.transformIncoming(URI.parse(params.connectionId))).toString(true);
		}
		const response = await this._resolveProvider(handle).getQueryRows({ ownerUri: transformedId ?? params.connectionId, batchIndex: params.batchIndex, resultSetIndex: params.resultIndex, rowsCount: params.rowCount, rowsStartIndex: params.startIndex });
		return { rowCount: response.resultSubset.rowCount, rows: response.resultSubset.rows.map(r => r.map(c => c.displayValue)) };
	}

	async $parseSyntax(handle: number, ownerUri: string, query: string): Promise<protocol.IParseResult> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformIncoming(URI.parse(ownerUri))).toString(true);
		}
		const response = await this._resolveProvider(handle).parseSyntax(ownerUri, query);
		return { success: response.parseable, errors: response.errors };
	}

	async $disposeQuery(handle: number, ownerUri: string): Promise<void> {
		if (this.uriTransformer) {
			ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(ownerUri))).toString(true);
		}
		return this._resolveProvider(handle).disposeQuery(ownerUri);
	}

	registerProvider(provider: azdata.QueryProvider): vscode.Disposable {
		const disposables = new DisposableStore();
		const providerEmitters = {
			onQueryComplete: new Emitter<azdata.QueryExecuteCompleteNotificationResult>(),
			onBatchStart: new Emitter<azdata.QueryExecuteBatchNotificationParams>(),
			onBatchComplete: new Emitter<azdata.QueryExecuteBatchNotificationParams>(),
			onResultSetAvailable: new Emitter<azdata.QueryExecuteResultSetNotificationParams>(),
			onResultSetUpdated: new Emitter<azdata.QueryExecuteResultSetNotificationParams>(),
			onMessage: new Emitter<azdata.QueryExecuteMessageParams>(),
			onEditSessionReady: new Emitter<{ ownerUri: string; success: boolean; message: string }>()
		};

		disposables.add(combinedDisposable(...values(providerEmitters)));

		provider.registerOnQueryComplete(e => providerEmitters.onQueryComplete.fire(e));
		provider.registerOnBatchStart(e => providerEmitters.onBatchStart.fire(e));
		provider.registerOnBatchComplete(e => providerEmitters.onBatchComplete.fire(e));
		provider.registerOnResultSetAvailable(e => providerEmitters.onResultSetAvailable.fire(e));
		provider.registerOnResultSetUpdated(e => providerEmitters.onResultSetUpdated.fire(e));
		provider.registerOnMessage(e => providerEmitters.onMessage.fire(e));
		provider.registerOnEditSessionReady((ownerUri: string, success: boolean, message: string) => providerEmitters.onEditSessionReady.fire({ ownerUri, success, message }));

		disposables.add(this.registerProvider2({
			cancelQuery: provider.cancelQuery.bind(provider),
			commitEdit: provider.commitEdit.bind(provider),
			createRow: provider.createRow.bind(provider),
			deleteRow: provider.deleteRow.bind(provider),
			disposeEdit: provider.disposeEdit.bind(provider),
			disposeQuery: provider.disposeQuery.bind(provider),
			getEditRows: provider.getEditRows.bind(provider),
			getQueryRows: provider.getQueryRows.bind(provider),
			initializeEdit: provider.initializeEdit.bind(provider),
			parseSyntax: provider.parseSyntax.bind(provider),
			revertCell: provider.revertCell.bind(provider),
			revertRow: provider.revertRow.bind(provider),
			runQuery: provider.runQuery.bind(provider),
			runQueryAndReturn: provider.runQueryAndReturn.bind(provider),
			runQueryStatement: provider.runQueryStatement.bind(provider),
			runQueryString: provider.runQueryString.bind(provider),
			saveResults: provider.saveResults.bind(provider),
			setQueryExecutionOptions: provider.setQueryExecutionOptions.bind(provider),
			updateCell: provider.updateCell.bind(provider),
			onBatchComplete: providerEmitters.onBatchComplete.event,
			onBatchStart: providerEmitters.onBatchStart.event,
			onEditSessionReady: providerEmitters.onEditSessionReady.event,
			onMessage: providerEmitters.onMessage.event,
			onQueryComplete: providerEmitters.onQueryComplete.event,
			onResultSetAvailable: providerEmitters.onResultSetAvailable.event,
			onResultSetUpdated: providerEmitters.onResultSetUpdated.event,
			providerId: provider.providerId
		}));

		return disposables;
	}

	public registerProvider2(provider: azdata.QueryProvider2): vscode.Disposable {
		const handle = this._nextHandle();
		const disposables = new DisposableStore();

		disposables.add(provider.onQueryComplete(result => {
			if (this.uriTransformer) {
				result.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(result.ownerUri))).toString(true);
			}
			// clear messages to maintain the order of things
			if (this.messageRunner.isScheduled()) {
				this.messageRunner.cancel();
				this.sendMessages();
			}
			this.proxy.$onQueryComplete(handle, { connectionId: result.ownerUri });
		}));

		disposables.add(provider.onBatchStart(batchInfo => {
			if (this.uriTransformer) {
				batchInfo.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(batchInfo.ownerUri))).toString(true);
			}
			this.proxy.$onBatchStart(handle, { connectionId: batchInfo.ownerUri, executionStart: new Date(batchInfo.batchSummary.executionStart).getTime(), index: batchInfo.batchSummary.id });
		}));

		disposables.add(provider.onBatchComplete(batchInfo => {
			if (this.uriTransformer) {
				batchInfo.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(batchInfo.ownerUri))).toString(true);
			}
			// clear messages to maintain the order of things
			if (this.messageRunner.isScheduled()) {
				this.messageRunner.cancel();
				this.sendMessages();
			}
			this.proxy.$onBatchComplete(handle, { connectionId: batchInfo.ownerUri, index: batchInfo.batchSummary.id, executionEnd: new Date(batchInfo.batchSummary.executionEnd).getTime() });
		}));

		disposables.add(provider.onResultSetAvailable(resultSetInfo => {
			if (this.uriTransformer) {
				resultSetInfo.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(resultSetInfo.ownerUri))).toString(true);
			}
			this.proxy.$onResultSetAvailable(handle, { connectionId: resultSetInfo.ownerUri, completed: resultSetInfo.resultSetSummary.complete, resultIndex: resultSetInfo.resultSetSummary.id, rowCount: resultSetInfo.resultSetSummary.rowCount, batchIndex: resultSetInfo.resultSetSummary.batchId, columns: resultSetInfo.resultSetSummary.columnInfo.map(c => ({ title: c.columnName, type: c.isXml ? protocol.ColumnType.XML : c.isJson ? protocol.ColumnType.JSON : protocol.ColumnType.UNKNOWN })) });
		}));

		disposables.add(provider.onResultSetUpdated(resultSetInfo => {
			if (this.uriTransformer) {
				resultSetInfo.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(resultSetInfo.ownerUri))).toString(true);
			}
			this.proxy.$onResultSetUpdated(handle, { connectionId: resultSetInfo.ownerUri, rowCount: resultSetInfo.resultSetSummary.rowCount, resultIndex: resultSetInfo.resultSetSummary.id, completed: resultSetInfo.resultSetSummary.complete, batchIndex: resultSetInfo.resultSetSummary.batchId, columns: resultSetInfo.resultSetSummary.columnInfo.map(c => ({ title: c.columnName, type: c.isXml ? protocol.ColumnType.XML : c.isJson ? protocol.ColumnType.JSON : protocol.ColumnType.UNKNOWN })) });
		}));

		disposables.add(provider.onMessage(message => {
			if (this.uriTransformer) {
				message.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(message.ownerUri))).toString(true);
			}
			this.handleMessage(handle, message);
		}));

		disposables.add(provider.onEditSessionReady(({ ownerUri, success, message }) => {
			if (this.uriTransformer) {
				ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(ownerUri))).toString(true);
			}
			this.proxy.$onEditSessionReady(handle, ownerUri, success, message);
		}));

		this.providers.set(handle, provider);
		this.proxy.$registerProvider(provider.providerId, handle);

		disposables.add(new types.Disposable(() => {
			this.proxy.$unregisterProvider(handle);
			this.providers.delete(handle);
		}));

		return disposables;
	}

	private handleMessage(handle: number, message: azdata.QueryExecuteMessageParams): void {
		if (this.uriTransformer) {
			message.ownerUri = URI.from(this.uriTransformer.transformOutgoing(URI.parse(message.ownerUri))).toString(true);
		}
		if (!this.queuedMessages.has(handle)) {
			this.queuedMessages.set(handle, new Map<string, azdata.IResultMessage[]>());
		}
		if (!this.queuedMessages.get(handle).has(message.ownerUri)) {
			this.queuedMessages.get(handle).set(message.ownerUri, []);
		}
		this.queuedMessages.get(handle).get(message.ownerUri).push(message.message);
		if (!this.messageRunner.isScheduled()) {
			this.messageRunner.schedule();
		}
	}

	private sendMessages() {
		const messages = mapToSerializable(this.queuedMessages, v => mapToSerializable(v));
		this.queuedMessages.clear();
		this.proxy.$onQueryMessage(messages);
	}

	private _resolveProvider(handle: number): azdata.QueryProvider2 {
		let provider = this.providers.get(handle);
		if (provider) {
			return provider;
		} else {
			throw new Error(`Unfound provider ${handle}`);
		}
	}
}

function rangeToSelectionData(range?: IRange): azdata.ISelectionData | undefined {
	return isUndefined(range) ? undefined : { startLine: range.startLineNumber - 1, startColumn: range.startColumn - 1, endLine: range.endLineNumber - 1, endColumn: range.endColumn - 1 };
}
