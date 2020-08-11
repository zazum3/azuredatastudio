/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { MigrationWizardController } from './migrationWizardController';
import { IMigrationWizardDataModel } from './migrationWizardModel';

export class AssessmentPage {
	protected readonly wizardPage: azdata.window.WizardPage | undefined;
	protected readonly instance: MigrationWizardController;
	protected readonly view: azdata.ModelView;
	protected readonly model: IMigrationWizardDataModel;

	protected readonly _view: azdata.ModelView | undefined;
	private _form: azdata.FormContainer | undefined;

	private _connectionTextBox: azdata.InputBoxComponent | undefined;
	private _runAssessmentButton: azdata.ButtonComponent | undefined;

	constructor(instance: MigrationWizardController, wizardPage: azdata.window.WizardPage | undefined,
		model: IMigrationWizardDataModel, view: azdata.ModelView) {
		this.instance = instance;
		this.wizardPage = wizardPage;
		this.view = view;
		this.model = model;
	}

	private async createAssessmentComponent(): Promise<azdata.FormComponent> {
		this._connectionTextBox = this.view.modelBuilder.inputBox().withProperties({
			placeHolder: this.model.serverId + ', ' + this.model.database
		}).component();
		this._runAssessmentButton = this.view.modelBuilder.button().withProperties({
			label: 'Run Assessment',
		}).component();

		this._runAssessmentButton.onDidClick(async (click) => {

		});

		return {
			component: this._connectionTextBox,
			title: 'Connection',
			actions: [this._runAssessmentButton]
		};
	}

	async start(): Promise<boolean> {
		let fileBrowserComponent = await this.createAssessmentComponent();

		this._form = this.view.modelBuilder.formContainer()
			.withFormItems(
				[
					fileBrowserComponent
				]).component();

		await this.view.initializeModel(this._form);
		return true;
	}

	async onPageEnter(): Promise<boolean> {
		return true;
	}

	async onPageLeave(): Promise<boolean> {
		return true;
	}

	public async cleanup(): Promise<boolean> {
		return true;
	}

	public setupNavigationValidator() {
		return true;
	}
}
