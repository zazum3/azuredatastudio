/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { AppContext } from '../appContext';
import { SqlOpsDataClient, ISqlOpsFeature } from 'dataprotocol-client';
import { ClientCapabilities } from 'vscode-languageclient';
import * as constants from '../constants';
import * as contracts from '../contracts';

export interface ISqlMigrationService {
	getAssessments(ownerId: string): Promise<contracts.MigrationAssessmentResult | undefined>;
}

export class SqlMigrationService implements ISqlMigrationService {
	public static asFeature(context: AppContext): ISqlOpsFeature {
		return class extends SqlMigrationService {
			constructor(client: SqlOpsDataClient) {
				super(context, client);
			}

			fillClientCapabilities(capabilities: ClientCapabilities): void {
			}

			initialize(): void {
			}
		};
	}

	private constructor(context: AppContext, protected readonly client: SqlOpsDataClient) {
		context.registerService(constants.NotebookConvertService, this);
	}

	async getAssessments(ownerUri: string): Promise<contracts.MigrationAssessmentResult | undefined> {
		let params: contracts.MigrationAssessmentParams = { ownerUri: ownerUri };
		try {
			let result = await this.client.sendRequest(contracts.MigrationAssessmenRequest.type, params);
			return result;
		}
		catch (e) {
			this.client.logFailedRequest(contracts.MigrationAssessmenRequest.type, e);
		}

		return undefined;
	}
}
