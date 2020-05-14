/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IADSEditorService } from 'sql/workbench/services/queryEditor/common/adsEditorService';
import { UntitledQueryEditorInput } from 'sql/workbench/common/editor/query/untitledQueryEditorInput';

import { IEditorService, IResourceEditorInputType } from 'vs/workbench/services/editor/common/editorService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { IEditorInput } from 'vs/workbench/common/editor';
import { UntitledNotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/untitledNotebookInput';
import { FileQueryEditorInput } from 'sql/workbench/contrib/query/common/fileQueryEditorInput';
import { FileNotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/fileNotebookInput';
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';

/**
 * Service wrapper for opening and creating SQL documents as sql editor inputs
 */
export class ADSEditorService implements IADSEditorService {

	_serviceBrand: undefined;

	constructor(
		@IInstantiationService private readonly instantiationService: IInstantiationService,
		@IEditorService private readonly editorService: IEditorService,
	) {
	}

	public createNotebookEditorInput(input: IResourceEditorInputType): IEditorInput {
		const baseInput = this.editorService.createEditorInput(input) as UntitledTextEditorInput | FileEditorInput;

		if (baseInput instanceof UntitledTextEditorInput) {
			return this.instantiationService.createInstance(UntitledNotebookEditorInput, baseInput);
		} else {
			return this.instantiationService.createInstance(FileNotebookEditorInput, baseInput);
		}
	}

	public createQueryEditorInput(input: IResourceEditorInputType): IEditorInput {
		const baseInput = this.editorService.createEditorInput(input) as UntitledTextEditorInput | FileEditorInput;

		if (baseInput instanceof UntitledTextEditorInput) {
			return this.instantiationService.createInstance(UntitledQueryEditorInput, baseInput, undefined);
		} else {
			return this.instantiationService.createInstance(FileQueryEditorInput, baseInput, undefined);
		}
	}
}
