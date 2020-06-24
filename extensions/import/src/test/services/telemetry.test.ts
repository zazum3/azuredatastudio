/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as TypeMoq from 'typemoq';
import { Telemetry } from '../../services/telemetry';
import { ApiWrapper } from '../../common/apiWrapper';
import * as vscode from 'vscode';


describe('Telemetry test', function () {
	let mockApiWrapper: TypeMoq.IMock<ApiWrapper>;
	let mockWorkspaceCongifugration: TypeMoq.IMock<vscode.WorkspaceConfiguration>;

	beforeEach(function () {
		mockApiWrapper = TypeMoq.Mock.ofType(ApiWrapper);
		mockWorkspaceCongifugration =  TypeMoq.Mock.ofType(TestWorkspaceCongifugration);
	});

	it('send Telemetry events will not call sendTelemetryEvent when telemetry is disabled', function () {
		mockWorkspaceCongifugration.setup(x => x.get('enableTelemetry', true)).returns(function () { return true; });
		mockApiWrapper.setup(x => x.getConfiguration(TypeMoq.It.isAny())).returns(function () { return mockWorkspaceCongifugration.object; });
		mockApiWrapper.setup(x => x.getExtension('Microsoft.import')).returns(function () { return new TestExtension(); });

		Telemetry.initialize(mockApiWrapper.object);
		Telemetry.sendTelemetryEvent('testEvent', {});

	});
});

class TestWorkspaceCongifugration implements vscode.WorkspaceConfiguration {
	readonly [key: string]: any;
	get<T>(section: string): T;
	get<T>(section: string, defaultValue: T): T;
	get(section: any, defaultValue?: any) {
		throw new Error('Method not implemented.');
	}
	has(section: string): boolean {
		throw new Error('Method not implemented.');
	}
	inspect<T>(section: string): { key: string; defaultValue?: T; globalValue?: T; workspaceValue?: T; workspaceFolderValue?: T; defaultLanguageValue?: T; globalLanguageValue?: T; workspaceLanguageValue?: T; workspaceFolderLanguageValue?: T; languageIds?: string[]; } {
		throw new Error('Method not implemented.');
	}
	update(section: string, value: any, configurationTarget?: boolean | vscode.ConfigurationTarget, overrideInLanguage?: boolean): Thenable<void> {
		throw new Error('Method not implemented.');
	}
}

let mockPackageJSON = {
	name: 'testName',
	version: 'testVersion',
	aiKey: 'testKey'
}


class TestExtension implements vscode.Extension<any> {
	id: string;
	extensionUri: vscode.Uri;
	extensionPath: string;
	isActive: boolean;
	extensionKind: vscode.ExtensionKind;
	exports: any;
	activate(): Thenable<any> {
		throw new Error('Method not implemented.');
	}
	packageJSON = mockPackageJSON;
}
