/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// import * as azdata from 'azdata';
import * as vscode from 'vscode';
import { LiveShare, SharedService, SharedServiceProxy } from '../liveshare';

export class LiveShareDocumentState {
	public isConnected: boolean;
	public serverName?: string;
	public databaseName?: string;
}

export class StatusProvider {
	private _sharedService: SharedService;
	private _sharedServiceProxy: SharedServiceProxy;

	public constructor(
		private _isHost: boolean,
		private _vslsApi: LiveShare,
		service: any) {

		if (this._isHost) {
			this._sharedService = <SharedService>service;
			this.registerStatusProvider();
		} else {
			this._sharedServiceProxy = <SharedServiceProxy>service;
		}
	}

	private registerStatusProvider(): void {
		let self = this;
		this._sharedService.onRequest('getDocumentState', (args: any[]) => {
			if (args && args.length > 0) {

				let ownerUri =  vscode.Uri.parse(args[0].ownerUri);
				let localUri: vscode.Uri = self._vslsApi.convertSharedUriToLocal(ownerUri);
				localUri;

				//	azdata.connection.getUriForConnection

				let documentState: LiveShareDocumentState = {
					isConnected: true,
					serverName: 'localhost',
					databaseName: 'master'
				};

				return documentState;
			}
			return undefined;
		});
	}

	public getDocumentState(doc: vscode.TextDocument): Promise<LiveShareDocumentState> {
		if (!this._isHost) {
			return this._sharedServiceProxy.request('getDocumentState', [{
				ownerUri: doc.uri.toString()
			}]);
		} else {
			return Promise.resolve(undefined);
		}
	}
}
