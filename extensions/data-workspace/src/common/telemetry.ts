/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as Utils from './utils';
import * as vscode from 'vscode';

import AdsTelemetryReporter from 'ads-extension-telemetry';

const packageJson = require('../../package.json');

let packageInfo = Utils.getPackageInfo(packageJson)!;

export const TelemetryReporter = new AdsTelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);

export enum TelemetryViews {
	WorkspaceTreePane = 'WorkspaceTreePane',
	OpenExistingDialog = 'OpenExistingDialog',
	NewProjectDialog = 'NewProjectDialog',
	ProviderRegistration = 'ProviderRegistration'
}

export function CalculateRelativity(projectPath: string, workspacePath?: string): string {
	//vscode.workspace.asRelativePath(projectPath);

	return 'TODO';
}
