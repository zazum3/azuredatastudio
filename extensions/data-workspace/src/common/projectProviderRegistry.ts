/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IProjectProvider } from 'dataworkspace';
import * as vscode from 'vscode';
import { IProjectProviderRegistry } from './interfaces';
import { TelemetryReporter, TelemetryViews } from './telemetry';

export const ProjectProviderRegistry: IProjectProviderRegistry = new class implements IProjectProviderRegistry {
	private _providers = new Array<IProjectProvider>();
	private _providerFileExtensionMapping: { [key: string]: IProjectProvider } = {};
	private _providerProjectTypeMapping: { [key: string]: IProjectProvider } = {};

	registerProvider(provider: IProjectProvider): vscode.Disposable {
		this.validateProvider(provider);
		this._providers.push(provider);
		provider.supportedProjectTypes.forEach(projectType => {
			this._providerFileExtensionMapping[projectType.projectFileExtension.toUpperCase()] = provider;
			this._providerProjectTypeMapping[projectType.id.toUpperCase()] = provider;
		});

		TelemetryReporter.createActionEvent(TelemetryViews.ProviderRegistration, 'ProviderRegistered')
			.withAdditionalProperties({
				providerId: provider.providerExtensionId,
				extensions: provider.supportedProjectTypes.sort().join(', ')
			})
			.send();

		return new vscode.Disposable(() => {
			const idx = this._providers.indexOf(provider);
			if (idx >= 0) {
				this._providers.splice(idx, 1);
				provider.supportedProjectTypes.forEach(projectType => {
					delete this._providerFileExtensionMapping[projectType.projectFileExtension.toUpperCase()];
					delete this._providerProjectTypeMapping[projectType.id.toUpperCase()];
				});
			}
		});
	}

	get providers(): IProjectProvider[] {
		return this._providers.slice(0);
	}

	clear(): void {
		this._providers.length = 0;
	}

	validateProvider(provider: IProjectProvider): void {
	}

	getProviderByProjectExtension(extension: string): IProjectProvider | undefined {
		return extension ? this._providerFileExtensionMapping[extension.toUpperCase()] : undefined;
	}

	getProviderByProjectType(projectType: string): IProjectProvider | undefined {
		return projectType ? this._providerProjectTypeMapping[projectType.toUpperCase()] : undefined;
	}
};
