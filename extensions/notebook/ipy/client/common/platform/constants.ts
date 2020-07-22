/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// tslint:disable-next-line:no-suspicious-comment
// TODO : Drop all these in favor of IPlatformService.
// See https://github.com/microsoft/vscode-python/issues/8542.

export const WINDOWS_PATH_VARIABLE_NAME = 'Path';
export const NON_WINDOWS_PATH_VARIABLE_NAME = 'PATH';
export const IS_WINDOWS = /^win/.test(process.platform);
