/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { extHostNamedCustomer } from 'vs/workbench/api/common/extHostCustomers';
import * as protocol from 'sql/workbench/api/common/sqlExtHost.protocol';
import { Disposable, IDisposable, combinedDisposable, toDisposable } from 'vs/base/common/lifecycle';
import { Emitter } from 'vs/base/common/event';
import { IExtHostContext } from 'vs/workbench/api/common/extHost.protocol';
import { IResultMessage, IQueryService, IFetchResponse, IQueryProviderEvent, IResultSetSummary, IFetchSubsetParams } from 'sql/platform/query/common/queryService';
import { values } from 'vs/base/common/collections';

interface QueryEvents {
	readonly onQueryComplete: Emitter<IQueryProviderEvent>;
	readonly onBatchStart: Emitter<IQueryProviderEvent & { executionStart: number, index: number }>;
	readonly onBatchComplete: Emitter<IQueryProviderEvent & { executionEnd: number, index: number }>;
	readonly onResultSetAvailable: Emitter<IQueryProviderEvent & IResultSetSummary>;
	readonly onResultSetUpdated: Emitter<IQueryProviderEvent & IResultSetSummary>;
	readonly onMessage: Emitter<IQueryProviderEvent & { messages: IResultMessage | IResultMessage[] }>;
}

@extHostNamedCustomer(protocol.SqlMainContext.MainThreadQuery)
export class MainThreadQuery extends Disposable implements protocol.MainThreadQueryShape {

	private readonly proxy: protocol.ExtHostQueryShape;
	private readonly events = new Map<number, QueryEvents>();
	private readonly _registrations = new Map<number, IDisposable>();

	constructor(
		extHostContext: IExtHostContext,
		@IQueryService private readonly queryService: IQueryService
	) {
		super();
		this.proxy = extHostContext.getProxy(protocol.SqlExtHostContext.ExtHostQuery);
	}

	////#region query
	public async $registerProvider(providerId: string, handle: number): Promise<void> {
		const emitters = {
			onQueryComplete: new Emitter<IQueryProviderEvent>(),
			onBatchStart: new Emitter<IQueryProviderEvent & { executionStart: number, index: number }>(),
			onBatchComplete: new Emitter<IQueryProviderEvent & { executionEnd: number, index: number }>(),
			onResultSetAvailable: new Emitter<IQueryProviderEvent & IResultSetSummary>(),
			onResultSetUpdated: new Emitter<IQueryProviderEvent & IResultSetSummary>(),
			onMessage: new Emitter<IQueryProviderEvent & { messages: IResultMessage | IResultMessage[] }>()
		};
		this.events.set(handle, emitters);
		const disposable = this.queryService.registerProvider({
			id: providerId,
			onMessage: emitters.onMessage.event,
			onQueryComplete: emitters.onQueryComplete.event,
			onBatchStart: emitters.onBatchStart.event,
			onBatchComplete: emitters.onBatchComplete.event,
			onResultSetAvailable: emitters.onResultSetAvailable.event,
			onResultSetUpdated: emitters.onResultSetUpdated.event,
			runQuery: connectionId => this.proxy.$run(handle, connectionId), // for now we consider the connection to be the file but we shouldn't
			cancelQuery: async connectionId => (await this.proxy.$cancel(handle, connectionId)),
			fetchSubset: async (connectionId: string, params: IFetchSubsetParams): Promise<IFetchResponse> => this.proxy.$getRows(handle, { ...params, connectionId }),
			setExecutionOptions: (connection, options) => this.proxy.$setExecutionOptions(handle, connection, options)
		});

		this._registrations.set(handle,
			combinedDisposable(
				disposable,
				...values(emitters),
				toDisposable(() => this.events.delete(handle))
			)
		);
	}

	public $onQueryComplete(handle: number, result: protocol.IQueryProviderEvent): void {
		this.events.get(handle)?.onQueryComplete.fire(result);
	}

	public $onBatchStart(handle: number, event: protocol.IBatchStartEvent): void {
		this.events.get(handle)?.onBatchStart.fire(event);
	}

	public $onBatchComplete(handle: number, event: protocol.IBatchCompleteEvent): void {
		this.events.get(handle)?.onBatchComplete.fire(event);
	}

	public $onResultSetAvailable(handle: number, event: protocol.IResultSetEvent): void {
		this.events.get(handle)?.onResultSetAvailable.fire(event);
	}

	public $onResultSetUpdated(handle: number, event: protocol.IResultSetEvent): void {
		this.events.get(handle)?.onResultSetUpdated.fire(event);
	}

	public $onQueryMessage(messagesMap: [number, [string, protocol.IQueryMessage[]][]][]): void {
		for (const [handle, messagesUris] of messagesMap) {
			for (const [uri, messages] of messagesUris) {
				this.events.get(handle)?.onMessage.fire({ connectionId: uri, messages: messages });
			}
		}
	}
	//#endregion query

	public async $unregisterProvider(handle: number): Promise<void> {
		const disposable = this._registrations.get(handle);
		if (disposable) {
			disposable.dispose();
			this._registrations.delete(handle);
		}
	}

	// Query Management handlers
	public $onEditSessionReady(handle: number, ownerUri: string, success: boolean, message: string): void {
		this.queryManagementService.onEditSessionReady(ownerUri, success, message);
	}
}
