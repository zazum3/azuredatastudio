/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import * as loc from '../../localizedConstants';
import { IconPathHelper, cssStyles } from '../../constants';
import { DashboardPage } from '../components/dashboardPage';
import { AzureResourceViewerModel } from './azureResourceViewerModel';
import { azureResource } from '../../../../azurecore/src/azureResource/azure-resource';

export class AzureViewerOverviewPage extends DashboardPage {
	private model: AzureResourceViewerModel;
	private azureResourcesTable: azdata.DeclarativeTableComponent;
	private _allResourcesData: any[][];
	constructor(protected modelView: azdata.ModelView) {
		super(modelView);
		this.initialized = false;
		azdata.accounts.getAllAccounts().then((accounts) => {
			this.model = new AzureResourceViewerModel(accounts[0]);
			this.model.getAllResourcesForSubscription(accounts[0]).then((resources: azureResource.AzureResourceDatabaseServerExtendedProperties[]) => {
				this._allResourcesData = [];
				resources.forEach(resource => {
					this._allResourcesData.push([resource.name, resource.type, resource.resourceGroup, resource.location, resource.subscriptionId]);
				});
				this.azureResourcesTable.data = this._allResourcesData;
				this.initialized = true;
			});
		});
	}

	protected get title(): string {
		return loc.overview;
	}

	protected get id(): string {
		return 'azure-resources-overview';
	}

	protected get icon(): { dark: string; light: string; } {
		return IconPathHelper.connection;
	}

	protected get container(): azdata.Component {
		let resourceData: any[][] = [];
		const outerDiv = this.modelView.modelBuilder.divContainer().component();
		const inputBoxAndFiltersDiv = this.modelView.modelBuilder.divContainer().withProperties<azdata.DivContainerProperties>({
			height: 40,
			display: 'flex',
			CSSStyles: { 'flex-direction': 'row', 'padding-top': '20px', 'padding-bottom': '20px', 'padding-left': '15px' }

		}).component();
		let filterInputBox = this.modelView.modelBuilder.inputBox().withProperties<azdata.InputBoxProperties>({
			placeHolder: 'Filter by name',
			width: 180,
			height: 24,
			ariaLabel: 'Resource name filter input box'
		}).component();

		let subscriptionPill = this.modelView.modelBuilder.dom().withProperties<azdata.DomProperties>({
			height: 24,
			CSSStyles: { 'border': '1px solid #161616', 'box-sizing': 'border-box', 'border-radius': '12px' }
		}).component();
		inputBoxAndFiltersDiv.addItems([filterInputBox, subscriptionPill]);
		filterInputBox.onTextChanged(text => {
			if (text) {
				this.azureResourcesTable.data = this._allResourcesData.filter(e => {
					return e[0].toLowerCase().includes(text.toLowerCase());
				});
			} else {
				this.azureResourcesTable.data = this._allResourcesData;
			}
		});

		// Azure Resources
		this.azureResourcesTable = this.modelView.modelBuilder.declarativeTable().withProperties<azdata.DeclarativeTableProperties>({
			width: '100%',
			columns: [
				createDefaultDeclarativeTableColumn(loc.nameColumn, '25%'),
				createDefaultDeclarativeTableColumn(loc.resourceTypeColumn, '25%'),
				createDefaultDeclarativeTableColumn(loc.resourceGroupColumn),
				createDefaultDeclarativeTableColumn(loc.locationColumn, '10%'),
				createDefaultDeclarativeTableColumn(loc.subscriptionColumn)
			],
			data: resourceData,
			CSSStyles: { 'margin-left': '10px', 'margin-right': '10px' }
		}).component();
		outerDiv.addItems([
			inputBoxAndFiltersDiv,
			this.azureResourcesTable
		]);
		return outerDiv;
	}

	protected get toolbarContainer(): azdata.ToolbarContainer {
		return this.modelView.modelBuilder.toolbarContainer().withToolbarItems([]).component();
	}
}

function createDefaultDeclarativeTableColumn(name: string, width = '20%'): azdata.DeclarativeTableColumn {
	return {
		displayName: name,
		valueType: azdata.DeclarativeDataType.string,
		isReadOnly: true,
		width: width,
		headerCssStyles: cssStyles.tableHeader,
		rowCssStyles: {
			...cssStyles.tableRow,
			'overflow': 'hidden',
			'text-overflow': 'ellipsis',
			'white-space': 'nowrap',
			'max-width': '0'
		}
	};
}
