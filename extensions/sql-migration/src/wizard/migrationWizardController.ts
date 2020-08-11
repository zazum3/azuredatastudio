/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as vscode from 'vscode';

// pages
import { AssessmentPage } from './assessmentPage';
import { IMigrationWizardDataModel } from './migrationWizardModel';

export class MigrationWizardController {
	public wizard: azdata.window.Wizard | undefined;
	public page1: azdata.window.WizardPage | undefined;
	public assessmentPage: AssessmentPage | undefined;

	constructor(
	) {
	}

	public async start(p: any, ...args: any[]) {
		let model = {} as IMigrationWizardDataModel;
		let profile = p?.connectionProfile as azdata.IConnectionProfile;
		if (profile) {
			model.serverId = profile.id;
			model.database = profile.databaseName;
		}

		let connectionId: string = await this.getConnectionId();
		if (!connectionId) {
			return;
		}

		let connectionUri = await azdata.connection.getUriForConnection(connectionId);
		// let currentConnection = await azdata.connection.getCurrentConnection();
		model.serverId = connectionId;
		model.database = connectionUri;

		let pages: Map<number, AssessmentPage> = new Map<number, AssessmentPage>();
		this.wizard = azdata.window.createWizard('SQL Migration');
		this.page1 = azdata.window.createWizardPage('Assessments');

		this.page1.registerContent(async (view) => {
			this.assessmentPage = new AssessmentPage(this, this.page1, model, view);
			pages.set(0, this.assessmentPage);
			await this.assessmentPage.start().then(() => {
				if (this.assessmentPage) {
					this.assessmentPage.setupNavigationValidator();
					this.assessmentPage.onPageEnter();
				}
			});
		});

		this.wizard.onPageChanged(async (event) => {
			let newPageIdx = event.newPage;
			let lastPageIdx = event.lastPage;
			let newPage = pages.get(newPageIdx);
			let lastPage = pages.get(lastPageIdx);
			if (lastPage) {
				await lastPage.onPageLeave();
			}
			if (newPage) {
				newPage.setupNavigationValidator();
				await newPage.onPageEnter();
			}
		});

		this.wizard.generateScriptButton.hidden = true;
		this.wizard.pages = [this.page1];
		this.wizard.open();
	}

	public async getConnectionId(): Promise<string> {
		let currentConnection = await azdata.connection.getCurrentConnection();

		let connectionId: string;

		if (!currentConnection) {
			let connection = await azdata.connection.openConnectionDialog();
			if (!connection) {
				vscode.window.showErrorMessage('error connection');
				return <string><any>undefined;
			}
			connectionId = connection.connectionId;
		} else {
			if (currentConnection.providerId !== 'MSSQL') {
				vscode.window.showErrorMessage('error provider');
				return <string><any>undefined;
			}
			connectionId = currentConnection.connectionId;
		}
		return connectionId;
	}
}
