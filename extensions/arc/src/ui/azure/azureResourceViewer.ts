/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { Dashboard } from '../components/dashboard';
import { AzureViewerOverviewPage } from './azureResourceViewerOverviewPage';

export class AzureResourceViewer extends Dashboard {
	constructor(title: string) {
		super(title);
	}

	protected async registerTabs(modelView: azdata.ModelView): Promise<(azdata.DashboardTab | azdata.DashboardTabGroup)[]> {
		const overviewPage = new AzureViewerOverviewPage(modelView);
		return [
			overviewPage.tab
		];
	}
}
