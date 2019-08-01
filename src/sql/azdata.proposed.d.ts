/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// This is the place for API experiments and proposal.

import * as vscode from 'vscode';

declare module 'azdata' {
	/**
	 * Namespace for connection management
	 */
	export namespace connection {
		export type ConnectionEventType =
			| 'onConnect'
			| 'onDisconnect'
			| 'onConnectionChanged';

		export interface ConnectionEventListener {
			onConnectionEvent(type: ConnectionEventType, ownerUri: string, args: IConnectionProfile): void;
		}

		/**
		 * Register a connection event listener
		 */
		export function registerConnectionEventListener(listener: connection.ConnectionEventListener): void;
	}
}

// declare module 'vscode' {
// 	export enum CompletionItemKind {
// 		Table = 1000,
// 		View = 1001,
// 		StoredProcedure = 1002,
// 		TableValueFunction = 1003,
// 		Column = 1004,
// 		SqlFunction = 1005
// 	}
// }
