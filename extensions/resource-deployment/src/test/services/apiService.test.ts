/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'mocha';
import { apiService } from '../../services/apiService';
import * as should from 'should';

describe('API Service Tests', function (): void {
	it('get azurecoreApi returns azure api', async function () {
		const api = apiService.azurecoreApi;
		should(api).not.be.undefined();
	});
});
