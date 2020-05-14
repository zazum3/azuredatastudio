/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { NotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/notebookInput';
import { INotebookService } from 'sql/workbench/services/notebook/browser/notebookService';
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';

export class FileNotebookEditorInput extends NotebookEditorInput {
	public static ID: string = 'workbench.editorinputs.fileNotebookInput';

	constructor(
		input: FileEditorInput,
		@ITextModelService textModelService: ITextModelService,
		@IInstantiationService instantiationService: IInstantiationService,
		@INotebookService notebookService: INotebookService,
		@IExtensionService extensionService: IExtensionService
	) {
		super(input, textModelService, instantiationService, notebookService, extensionService);
	}

	public get textInput(): FileEditorInput {
		return super.textInput as FileEditorInput;
	}

	public setMode(mode: string): void {
		this.textInput.setMode(mode);
	}

	public setPreferredMode(mode: string): void {
		this.textInput.setPreferredMode(mode);
	}

	public getTypeId(): string {
		return FileNotebookEditorInput.ID;
	}
}
