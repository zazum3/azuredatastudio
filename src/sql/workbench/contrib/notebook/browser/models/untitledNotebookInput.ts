/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ITextModelService } from 'vs/editor/common/services/resolverService';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IExtensionService } from 'vs/workbench/services/extensions/common/extensions';
import { NotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/notebookInput';
import { INotebookService } from 'sql/workbench/services/notebook/browser/notebookService';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';

export class UntitledNotebookEditorInput extends NotebookEditorInput {
	public static ID: string = 'workbench.editorinputs.untitledNotebookInput';

	constructor(
		input: UntitledTextEditorInput,
		@ITextModelService textModelService: ITextModelService,
		@IInstantiationService instantiationService: IInstantiationService,
		@INotebookService notebookService: INotebookService,
		@IExtensionService extensionService: IExtensionService
	) {
		super(input, textModelService, instantiationService, notebookService, extensionService);
	}

	public get textInput(): UntitledTextEditorInput {
		return super.textInput as UntitledTextEditorInput;
	}

	public setMode(mode: string): void {
		this.textInput.setMode(mode);
	}

	isUntitled(): boolean {
		// Subclasses need to explicitly opt-in to being untitled.
		return true;
	}

	public getTypeId(): string {
		return UntitledNotebookEditorInput.ID;
	}
}
