/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as sinon from 'sinon';
import * as assert from 'assert';
import { ADSEditorService } from 'sql/workbench/services/queryEditor/browser/adsEditorService';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IUntitledTextEditorService } from 'vs/workbench/services/untitled/common/untitledTextEditorService';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { workbenchInstantiationService } from 'sql/workbench/test/workbenchTestServices';

suite('Query Editor Service', () => {
	test('does open input when requested', async () => {
		const instantiationService = workbenchInstantiationService();
		const editorService = instantiationService.invokeFunction(accessor => accessor.get(IEditorService));
		const untitledService = instantiationService.invokeFunction(accessor => accessor.get(IUntitledTextEditorService));
		const openStub = sinon.stub(editorService, 'openEditor', () => Promise.resolve());
		sinon.stub(editorService, 'createEditorInput', () => instantiationService.createInstance(UntitledTextEditorInput, untitledService.create()));
		const queryEditorService = instantiationService.createInstance(ADSEditorService);

		await queryEditorService.newSqlEditor({ open: true });

		assert(openStub.calledOnce);
	});

	test('does open input by default', async () => {
		const instantiationService = workbenchInstantiationService();
		const editorService = instantiationService.invokeFunction(accessor => accessor.get(IEditorService));
		const untitledService = instantiationService.invokeFunction(accessor => accessor.get(IUntitledTextEditorService));
		const openStub = sinon.stub(editorService, 'openEditor', () => Promise.resolve());
		sinon.stub(editorService, 'createEditorInput', () => instantiationService.createInstance(UntitledTextEditorInput, untitledService.create()));
		const queryEditorService = instantiationService.createInstance(ADSEditorService);

		await queryEditorService.newSqlEditor();

		assert(openStub.calledOnce);
	});

	test('doesnt open input when requested', async () => {
		const instantiationService = workbenchInstantiationService();
		const editorService = instantiationService.invokeFunction(accessor => accessor.get(IEditorService));
		const untitledService = instantiationService.invokeFunction(accessor => accessor.get(IUntitledTextEditorService));
		const openStub = sinon.stub(editorService, 'openEditor', () => Promise.resolve());
		sinon.stub(editorService, 'createEditorInput', () => instantiationService.createInstance(UntitledTextEditorInput, untitledService.create()));
		const queryEditorService = instantiationService.createInstance(ADSEditorService);

		await queryEditorService.newSqlEditor({ open: false });

		assert(openStub.notCalled);
	});
});
