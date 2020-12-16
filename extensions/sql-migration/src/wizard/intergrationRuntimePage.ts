/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { MigrationWizardPage } from '../models/migrationWizardPage';
import { MigrationStateModel, StateChangeEvent } from '../models/stateMachine';

export class IntergrationRuntimePage extends MigrationWizardPage {

	private migrationControllerDropdown!: azdata.DropDownComponent;

	private defaultSetupRadioButton!: azdata.RadioButtonComponent;
	private customSetupRadioButton!: azdata.RadioButtonComponent;

	private startSetupButton!: azdata.ButtonComponent;
	private cancelSetupButton!: azdata.ButtonComponent;

	private createMigrationContainer!: azdata.FlexContainer;


	constructor(wizard: azdata.window.Wizard, migrationStateModel: MigrationStateModel) {
		super(wizard, azdata.window.createWizardPage('Migration Controller'), migrationStateModel);
	}

	protected async registerContent(view: azdata.ModelView): Promise<void> {

		const descriptionText = view.modelBuilder.text().withProps({
			value: 'An migration controller is an ARM (Azure Resource Manager) resource created in your Azure subscription and it is needed to coordinate and monitor data migration activities. If one already exists in your subscription, you can reuse it here. Alternatively you can create a new one by clicking New. {0}',
			links: [
				{
					url: '',
					text: 'Learn More'
				},
			]
		}).component();

		this.migrationControllerDropdown = view.modelBuilder.dropDown().withProps({
		}).component();


		const createNewController = view.modelBuilder.button().withProps({
			label: 'New',
			width: '100px'
		}).component();

		createNewController.onDidClick((e) => {
			this.createMigrationContainer.display = 'inline';
		});

		const setupButtonGroup = 'setupOptions';

		this.defaultSetupRadioButton = view.modelBuilder.radioButton().withProps({
			label: 'Setup with defaults: Add migration controller with one click express setup using default options.',
			name: setupButtonGroup
		}).component();

		this.customSetupRadioButton = view.modelBuilder.radioButton().withProps({
			label: 'Custom setup: Add migration controller after customizing most options.',
			name: setupButtonGroup
		}).component();

		this.startSetupButton = view.modelBuilder.button().withProps({
			label: 'Create',
			width: '100px'
		}).component();

		this.startSetupButton.onDidClick((e) => {
			if (this.defaultSetupRadioButton.checked) {

			} else {

			}
		});

		this.cancelSetupButton = view.modelBuilder.button().withProps({
			label: 'Cancel',
			width: '100px'
		}).component();

		this.cancelSetupButton.onDidClick((e) => {
			this.createMigrationContainer.display = 'none';
		});

		const setupButtonsContainer = view.modelBuilder.flexContainer().withItems([
			this.startSetupButton,
			this.cancelSetupButton
		],
			{ CSSStyles: { 'margin': '10px', } }
		).withLayout({
			flexFlow: 'row'
		}).component();

		this.createMigrationContainer = view.modelBuilder.flexContainer().withItems(
			[
				this.defaultSetupRadioButton,
				this.customSetupRadioButton,
				setupButtonsContainer
			]
		).withLayout({
			flexFlow: 'column'
		}).component();

		this.createMigrationContainer.display = 'none';

		const form = view.modelBuilder.formContainer()
			.withFormItems(
				[
					{
						component: descriptionText
					},
					{
						title: 'Select a migration controller',
						component: this.migrationControllerDropdown
					},
					{
						component: createNewController
					},
					{
						component: this.createMigrationContainer
					},

				]
			);
		await view.initializeModel(form.component());
	}

	public async onPageEnter(): Promise<void> {
	}

	public async onPageLeave(): Promise<void> {
	}

	protected async handleStateChange(e: StateChangeEvent): Promise<void> {
	}
}
