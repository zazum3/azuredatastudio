/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ResourceServiceBase, GraphData } from '../resourceTreeDataProviderBase';
import { azureResource } from '../../azure-resource';

export interface ArcGraphData extends GraphData {
	properties: {
		admin: string;
		hybridDataManager: string;
	}
}

const resourcesQuery = 'where type == "microsoft.azuredata/sqlinstances" or type == "microsoft.azuredata/postgresinstances"';
export class AllArcResourcesService extends ResourceServiceBase<ArcGraphData, azureResource.AzureResourceDatabaseServerExtendedProperties> {

	protected get query(): string {
		return resourcesQuery;
	}

	protected convertResource(resource: ArcGraphData): azureResource.AzureResourceDatabaseServerExtendedProperties {
		return {
			id: resource.id,
			name: resource.name,
			fullName: resource.name,
			loginName: resource.properties.admin,
			defaultDatabaseName: 'master',
			location: resource.location,
			type: resource.type,
			resourceGroup: resource.resourceGroup,
			subscriptionId: resource.subscriptionId
		};
	}
}
