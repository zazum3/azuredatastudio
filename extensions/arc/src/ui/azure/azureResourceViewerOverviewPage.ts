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
	constructor(protected modelView: azdata.ModelView) {
		super(modelView);
		this.initialized = false;
		azdata.accounts.getAllAccounts().then((accounts) => {
			this.model = new AzureResourceViewerModel(accounts[0]);
			this.model.getAllResourcesForSubscription(accounts[0]).then((resources: azureResource.AzureResourceDatabaseServerExtendedProperties[]) => {
				let resourceData: any[][] = [];
				resources.forEach(resource => {
					resourceData.push([resource.name, resource.type, resource.resourceGroup, resource.location, resource.subscriptionId]);
				});
				this.azureResourcesTable.data = resourceData;
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
		const overview = this.modelView.modelBuilder.divContainer().component();
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
			data: resourceData
		}).component();
		overview.addItem(this.azureResourcesTable, { CSSStyles: { 'margin-left': '10px', 'margin-right': '10px' } });
		return overview;
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
