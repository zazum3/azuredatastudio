/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as azdata from 'azdata';
import { ExtensionContext, Disposable, commands } from 'vscode';
import { MigrationWizardController } from './wizard/migrationWizardController';

class SQLMigration {

	constructor(private readonly context: ExtensionContext) {
		this.registerCommands();
	}

	async start(): Promise<void> {
	}

	async registerCommands(): Promise<void> {
		const commandDisposables: Disposable[] = [ // Array of disposables returned by registerCommand
			commands.registerCommand('sqlmigration.start', (profile: azdata.IConnectionProfile, ...args: any[]) => {
				new MigrationWizardController().start(profile, args);
			}),
		];

		this.context.subscriptions.push(...commandDisposables);
	}

	stop(): void {
	}
}

let sqlMigration: SQLMigration;
export async function activate(context: ExtensionContext) {
	sqlMigration = new SQLMigration(context);
}

export function deactivate(): void {
	sqlMigration.stop();
}
