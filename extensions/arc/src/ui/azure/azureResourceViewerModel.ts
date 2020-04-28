/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';
import * as azurecore from '../../../../azurecore/src/azurecore';
import { azureResource } from '../../../../azurecore/src/azureResource/azure-resource';

export class AzureResourceViewerModel {

	private _subscriptionIdToName: Map<string, string> = new Map<string, string>();

	constructor(private _currentAccount: azdata.Account) {
	}

	public async getAllAccounts(): Promise<azdata.Account[]> {
		return await azdata.accounts.getAllAccounts();
	}

	public async getAllSubscritionsForAccount(account?: azdata.Account): Promise<azureResource.AzureResourceSubscription[]> | undefined {
		let accountToUse = account ? account : this._currentAccount;
		if (!accountToUse) {
			let accounts = await this.getAllAccounts();
			if (!accounts) {
				// Need to add new account
			}
		}
		try {
			let response = await vscode.commands.executeCommand<azurecore.GetSubscriptionsResult>('azure.accounts.getSubscriptions', accountToUse, true /*ignoreErrors*/);
			if (response.errors.length > 0) {
				// handle errors somehow
			}
			response.subscriptions.forEach(sub => {
				this._subscriptionIdToName.set(sub.id, sub.name);
			});
			return response.subscriptions;
		} catch (err) {
			return undefined;
		}
	}

	public get currentAccount(): azdata.Account {
		return this._currentAccount;
	}

	public set currentAccount(account: azdata.Account) {
		this._currentAccount = account;
	}

	public async getAllResourcesForSubscription(account?: azdata.Account) {
		let accountToUse = account ? account : this._currentAccount;
		let subscriptions = await this.getAllSubscritionsForAccount(accountToUse);
		try {
			let response = await vscode.commands.executeCommand<azurecore.GetAllResourcesResult>('azure.accounts.getResourcesInSubscription', accountToUse, subscriptions, true /*ignoreErrors*/);
			return this.fixUpResourceType(response).resources;
		} catch (err) {
			return undefined;
		}
	}

	private fixUpResourceType(result: azurecore.GetAllResourcesResult): azurecore.GetAllResourcesResult {
		result.resources.forEach(r => {
			r.subscriptionId = this._subscriptionIdToName.get(r.subscriptionId);
			switch (r.type) {
				case ResourceTypeMap.POSTGRES_HYPERSCALE_INSTANCE:
					r.type = 'PostgreSQL Hyperscale - Azure Arc';
					return;
				default:
					r.type = 'SQL Managed Instance - Azure Arc';
			}
		});
		return result;
	}
}

enum ResourceTypeMap {
	POSTGRES_HYPERSCALE_INSTANCE = 'microsoft.azuredata/postgresinstances',
	SQL_MANAGED_INSTANCE_AZURE_ARC = 'microsoft.azuredata/sqlinstances'
}
