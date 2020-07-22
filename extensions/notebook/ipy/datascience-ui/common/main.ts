/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare let __webpack_public_path__: string;

// tslint:disable-next-line: no-any
if ((window as any).__PVSC_Public_Path) {
	// This variable tells Webpack to this as the root path used to request webpack bundles.
	// tslint:disable-next-line: no-any
	__webpack_public_path__ = (window as any).__PVSC_Public_Path;
}
