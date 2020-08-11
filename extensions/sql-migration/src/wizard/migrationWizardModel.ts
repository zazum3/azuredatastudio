/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';

/**
 * The main data model that communicates between the pages.
 */
export interface IMigrationWizardDataModel {
	server: azdata.connection.Connection;
	serverId: string;
	ownerUri: string;
	database: string;
}
