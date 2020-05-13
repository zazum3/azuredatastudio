/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IQueryService, IQueryProvider, IQuery } from 'sql/platform/query/common/queryService';
import { IDisposable } from 'vs/base/common/lifecycle';
import { URI } from 'vs/base/common/uri';

export class TestQueryService implements IQueryService {
	providers: readonly string[];
	_serviceBrand: undefined;

	registerProvider(provider: IQueryProvider): IDisposable {
		throw new Error('Method not implemented.');
	}

	createOrGetQuery(associatedURI: URI, forceNew?: boolean): IQuery {
		throw new Error('Method not implemented.');
	}
}
