/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import { LiveShare, SharedServiceProxy } from './liveshare';
import { ConnectionProvider } from './providers/connectionProvider';
import { StatusProvider, LiveShareDocumentState } from './providers/statusProvider';
import { LiveShareServiceName, VslsSchema } from './constants';
import { QueryProvider } from './providers/queryProvider';

declare var require: any;
let vsls = require('vsls');

export class GuestSessionManager {
	private _statusProvider: StatusProvider;

	constructor(
		context: vscode.ExtensionContext,
		private _vslsApi: LiveShare
	) {
		let self = this;
		// vscode.workspace.onDidOpenTextDocument(params => this.onDidOpenTextDocument(params));

		self._vslsApi!.onDidChangeSession(async function onLiveShareSessionCHange(e: any) {
			const isHost = e.session.role === vsls.Role.Host;
			if (!e.session.id && isHost) {
				return;
			}

			const sharedServiceProxy: SharedServiceProxy = await self._vslsApi.getSharedService(LiveShareServiceName);
			if (!sharedServiceProxy) {
				vscode.window.showErrorMessage('Could not access a shared service. You have to set "liveshare.features" to "experimental" in your user settings in order to use this extension.');
				return;
			}

			const connectionProvider = new ConnectionProvider(isHost, self._vslsApi, sharedServiceProxy);

			const queryProvider = new QueryProvider(false, self._vslsApi);
			queryProvider.initialize(false, sharedServiceProxy);
			vscode.workspace.onDidOpenTextDocument((params) => {
				// it's a liveshare doc if opened from here
				const documentState: LiveShareDocumentState = {
					isConnected: true,
					serverName: 'liveshare',
					databaseName: 'liveshare'
				};
				self.onDidOpenTextDocument(params, documentState);
			});

			self._statusProvider = new StatusProvider(
				isHost,
				self._vslsApi,
				connectionProvider,
				sharedServiceProxy);
		});
	}

	private async onDidOpenTextDocument(doc: vscode.TextDocument, documentState?: LiveShareDocumentState): Promise<void> {
		if (this._statusProvider && this.isLiveShareDocument(doc)) {
			documentState = await this._statusProvider.getDocumentState(doc);
		}
		let queryDocument = await azdata.queryeditor.getQueryDocument(doc.uri.toString());
		if (queryDocument) {
			let connectionOptions: any[] = [];
			connectionOptions['serverName'] = documentState.serverName;
			connectionOptions['databaseName'] = documentState.databaseName;
			let profile = azdata.connection.ConnectionProfile.createFrom(connectionOptions);
			await queryDocument.connect(profile);
		}
	}

	private isLiveShareDocument(doc: vscode.TextDocument): boolean {
		let uri = this._vslsApi.convertLocalUriToShared(doc.uri);
		console.log(uri.toString());
		return doc && doc.uri.scheme === VslsSchema;
	}
}
