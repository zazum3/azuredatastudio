/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

// tslint:disable-next-line: no-any
async function requirePromise(pkg: string | string[]): Promise<any> {
	return new Promise((resolve, reject) => {
		// tslint:disable-next-line: no-any
		const requirejs = (window as any).requirejs;
		if (requirejs === undefined) {
			reject('Requirejs is needed, please ensure it is loaded on the page.');
		} else {
			requirejs(pkg, resolve, reject);
		}
	});
}
export function requireLoader(moduleName: string) {
	return requirePromise([`${moduleName}`]);
}
