/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as should from 'should';
import * as TypeMoq from 'typemoq';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as constants from '../../common/constants';
import { promises as fs } from 'fs';
import { WorkspaceService } from '../../services/workspaceService';
import { OpenExistingDialog } from '../../dialogs/openExistingDialog';
import { createProjectFile, generateUniqueProjectFilePath, generateUniqueWorkspaceFilePath, testProjectType } from '../testUtils';

suite('Open Existing Dialog', function (): void {
	const mockExtensionContext = TypeMoq.Mock.ofType<vscode.ExtensionContext>();

	this.afterEach(() => {
		sinon.restore();
	});

	test('Should validate project file exists', async function (): Promise<void> {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		const dialog = new OpenExistingDialog(workspaceServiceMock.object, mockExtensionContext.object);
		await dialog.open();

		dialog._targetTypeRadioCardGroup?.updateProperty( 'selectedCardId', constants.Project);
		dialog._filePathTextBox!.value = '';
		dialog.workspaceInputBox!.value = 'test.code-workspace';

		should.equal(await dialog.validate(), false, 'Validation fail because project file does not exist');

		// create a project file
		dialog._filePathTextBox!.value = await createProjectFile('testproj');
		should.equal(await dialog.validate(), true, 'Validation pass because project file exists');
	});

	test('Should validate workspace file exists', async function (): Promise<void> {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		const dialog = new OpenExistingDialog(workspaceServiceMock.object, mockExtensionContext.object);
		await dialog.open();

		dialog._targetTypeRadioCardGroup?.updateProperty( 'selectedCardId', constants.Workspace);
		dialog._filePathTextBox!.value = '';
		should.equal(await dialog.validate(), false, 'Validation fail because workspace file does not exist');

		// create a workspace file
		dialog._filePathTextBox!.value = generateUniqueWorkspaceFilePath();
		await fs.writeFile(dialog._filePathTextBox!.value , '');
		should.equal(await dialog.validate(), true, 'Validation pass because workspace file exists');
	});


	test('Should validate workspace in onComplete when opening project', async function (): Promise<void> {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		workspaceServiceMock.setup(x => x.validateWorkspace()).returns(() => Promise.resolve(true));
		workspaceServiceMock.setup(x => x.addProjectsToWorkspace(TypeMoq.It.isAny())).returns(() => Promise.resolve());

		const dialog = new OpenExistingDialog(workspaceServiceMock.object, mockExtensionContext.object);
		await dialog.open();

		dialog._filePathTextBox!.value = generateUniqueProjectFilePath('testproj');
		should.doesNotThrow(async () => await dialog.onComplete());

		workspaceServiceMock.setup(x => x.validateWorkspace()).throws(new Error('test error'));
		const spy = sinon.spy(vscode.window, 'showErrorMessage');
		should.doesNotThrow(async () => await dialog.onComplete(), 'Error should be caught');
		should(spy.calledOnce).be.true();
	});

	test('workspace browse', async function (): Promise<void> {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		sinon.stub(vscode.window, 'showOpenDialog').returns(Promise.resolve([]));

		const dialog = new OpenExistingDialog(workspaceServiceMock.object, mockExtensionContext.object);
		await dialog.open();
		should.equal(dialog._filePathTextBox!.value, '');
		await dialog.workspaceBrowse();
		should.equal(dialog._filePathTextBox!.value, '', 'Workspace file should not be set when no file is selected');

		sinon.restore();
		const workspaceFile = vscode.Uri.file(generateUniqueWorkspaceFilePath());
		sinon.stub(vscode.window, 'showOpenDialog').returns(Promise.resolve([workspaceFile]));
		await dialog.workspaceBrowse();
		should.equal(dialog._filePathTextBox!.value, workspaceFile.fsPath, 'Workspace file should get set');
		should.equal(dialog._filePathTextBox?.value, workspaceFile.fsPath);
	});

	test('project browse', async function (): Promise<void> {
		const workspaceServiceMock = TypeMoq.Mock.ofType<WorkspaceService>();
		workspaceServiceMock.setup(x => x.getAllProjectTypes()).returns(() => Promise.resolve([testProjectType]));
		sinon.stub(vscode.window, 'showOpenDialog').returns(Promise.resolve([]));

		const dialog = new OpenExistingDialog(workspaceServiceMock.object, mockExtensionContext.object);
		await dialog.open();
		should.equal(dialog._filePathTextBox!.value, '');
		await dialog.projectBrowse();
		should.equal(dialog._filePathTextBox!.value, '', 'Project file should not be set when no file is selected');

		sinon.restore();
		const projectFile = vscode.Uri.file(generateUniqueProjectFilePath('testproj'));
		sinon.stub(vscode.window, 'showOpenDialog').returns(Promise.resolve([projectFile]));
		await dialog.projectBrowse();
		should.equal(dialog._filePathTextBox!.value, projectFile.fsPath, 'Project file should be set');
		should.equal(dialog._filePathTextBox?.value, projectFile.fsPath);
	});
});

