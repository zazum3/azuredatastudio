/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as azdata from 'azdata';
import { EngineSettingsData, EngineSettingsModel } from './engineSettingsData';

export type ParametersModel = {
	parameterName: string,
	description: string,
	components: any[]
};

export async function activate(_: vscode.ExtensionContext): Promise<void> {
	const dashboard = azdata.window.createModelViewDashboard('Bug');
	dashboard.registerTabs(async (view: azdata.ModelView) => {
		return [getTab(view)];
	});
	dashboard.open();
}

function getTab(view: azdata.ModelView): azdata.DashboardTab {
	let disposables: vscode.Disposable[] = [];
	const root = view.modelBuilder.divContainer().component();
	const content = view.modelBuilder.divContainer().component();
	root.addItem(content, { CSSStyles: { 'margin': '20px' } });

	let _parameters = createParameters(view);

	let parametersTable = view.modelBuilder.declarativeTable().withProps({
		width: '100%',
		columns: [
			{
				displayName: 'Parameter Name',
				valueType: azdata.DeclarativeDataType.string,
				isReadOnly: true,
				width: '20%'
			},
			{
				displayName: 'Value',
				valueType: azdata.DeclarativeDataType.component,
				isReadOnly: false,
				width: '20%'
			},
			{
				displayName: 'Description',
				valueType: azdata.DeclarativeDataType.string,
				isReadOnly: true,
				width: '50%',
				rowCssStyles: {
					'overflow': 'hidden',
					'text-overflow': 'ellipsis',
					'white-space': 'nowrap',
					'max-width': '0'
				}
			},
			{
				displayName: 'Reset To Default',
				valueType: azdata.DeclarativeDataType.component,
				isReadOnly: false,
				width: '10%'
			}
		],
		data: _parameters.map(p => p.components!)
	}).component();

	let searchBox = view.modelBuilder.inputBox().withProps({
		readOnly: false,
		enabled: true,
		placeHolder: 'search'
	}).component();

	disposables.push(
		searchBox.onTextChanged(() => {
			if (!searchBox.value) {
				parametersTable.data = _parameters.map(p => p.components!);
			} else {
				filterParameters(searchBox.value.toLowerCase(), parametersTable, _parameters);
			}
		})
	);

	content.addItem(searchBox, { CSSStyles: { 'margin-block-start': '0px', 'margin-block-end': '0px', 'margin-bottom': '20px' } });
	content.addItem(parametersTable);

	return {
		title: 'Bug repro',
		id: 'Bug repro',
		content: root
	};
}

// Causes some of the azdata.DeclarativeDataType.component to not show when updating the table's data.
function filterParameters(search: string, parametersTable: azdata.DeclarativeTableComponent, _parameters: ParametersModel[]) {
	let filterData: any[] = [];
	let name: string;
	let description: string;

	_parameters.forEach(param => {
		name = param.parameterName?.toLowerCase();
		description = param.description?.toLowerCase();
		if (name.search(search) !== -1 || description.search(search) !== -1) {
			filterData.push(param.components!);
		}
	});

	parametersTable.data = filterData;
}

// Using 20 parameters, switch commented out code to use 300 parameters.
function createParameters(view: azdata.ModelView): ParametersModel[] {
	let _parameters: ParametersModel[] = [];
	let engineSettings = new EngineSettingsData;

	/* engineSettings.getSmallData().forEach(engineSetting => {
		_parameters.push(createParameterComponents(engineSetting, view));
	}); */

	engineSettings.getLargeData().forEach(engineSetting => {
		_parameters.push(createParameterComponents(engineSetting, view));
	});

	return _parameters;
}

function createParameterComponents(engineSetting: EngineSettingsModel, view: azdata.ModelView): ParametersModel {
	let data = [];

	// Set parameter name
	data.push(engineSetting.parameterName);

	// Container to hold input component and information bubble
	const valueContainer = view.modelBuilder.flexContainer().withLayout({ alignItems: 'center' }).component();

	// Information bubble title to be set depening on type of input
	let information = view.modelBuilder.button().withProps({
		width: '12px',
		height: '12px',
		enabled: false
	}).component();

	if (engineSetting.type === 'enum') {
		// If type is enum, component should be drop down menu
		let options = engineSetting.options?.slice(1, -1).split(',');
		let values: string[] = [];
		options!.forEach(option => {
			values.push(option.slice(option.indexOf('"') + 1, -1));
		});

		let valueBox = view.modelBuilder.dropDown().withProps({
			values: values,
			value: engineSetting.value,
			CSSStyles: { 'margin-block-start': '0px', 'margin-block-end': '0px' }
		}).component();
		valueContainer.addItem(valueBox, { CSSStyles: { 'margin-right': '0px' } });
	} else if (engineSetting.type === 'bool') {
		// If type is bool, component should be checkbox to turn on or off
		let valueBox = view.modelBuilder.checkBox().withProps({
			label: 'loc.on',
			CSSStyles: { 'margin-block-start': '0px', 'margin-block-end': '0px' }
		}).component();
		valueContainer.addItem(valueBox, { CSSStyles: { 'margin-right': '0px' } });
		if (engineSetting.value === 'on') {
			valueBox.checked = true;
		} else {
			valueBox.checked = false;
		}
	} else if (engineSetting.type === 'string') {
		// If type is string, component should be text inputbox
		let valueBox = view.modelBuilder.inputBox().withProps({
			required: true,
			readOnly: false,
			value: engineSetting.value,
			CSSStyles: { 'min-width': '50px', 'max-width': '200px' }
		}).component();
		valueContainer.addItem(valueBox, { CSSStyles: { 'margin-right': '0px' } });
	} else {
		// If type is real or interger, component should be inputbox set to inputType of number. Max and min values also set.
		let valueBox = view.modelBuilder.inputBox().withProps({
			required: true,
			readOnly: false,
			min: parseInt(engineSetting.min!),
			max: parseInt(engineSetting.max!),
			validationErrorMessage: 'loc.outOfRange(engineSetting.min!, engineSetting.max!)',
			inputType: 'number',
			value: engineSetting.value,
			CSSStyles: { 'min-width': '50px', 'max-width': '200px' }
		}).component();
		valueContainer.addItem(valueBox, { CSSStyles: { 'margin-right': '0px' } });
	}

	valueContainer.addItem(information, { CSSStyles: { 'margin-left': '5px' } });

	data.push(valueContainer);

	// Look into hoovering
	data.push(engineSetting.description);

	// Can reset individual component
	const resetParameter = view.modelBuilder.button().withProps({
		title: 'loc.resetToDefault',
		width: '20px',
		height: '20px',
		enabled: true
	}).component();
	data.push(resetParameter);

	let parameter: ParametersModel = {
		parameterName: engineSetting.parameterName!,
		description: engineSetting.description!,
		components: data
	};

	return parameter;
}
