/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import '../../common/extensions';

export class JupyterConnectError extends Error {
	constructor(message: string, stderr?: string) {
		super(message + (stderr ? `\n${stderr}` : ''));
	}
}
