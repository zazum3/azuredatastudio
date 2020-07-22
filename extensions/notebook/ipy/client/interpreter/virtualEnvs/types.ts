/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Uri } from 'vscode';
import { InterpreterType } from '../../pythonEnvironments/info';
export const IVirtualEnvironmentManager = Symbol('VirtualEnvironmentManager');
export interface IVirtualEnvironmentManager {
	getEnvironmentName(pythonPath: string, resource?: Uri): Promise<string>;
	getEnvironmentType(pythonPath: string, resource?: Uri): Promise<InterpreterType>;
	getPyEnvRoot(resource?: Uri): Promise<string | undefined>;
}
