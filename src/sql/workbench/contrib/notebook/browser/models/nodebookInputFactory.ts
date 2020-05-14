/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEditorInputFactory, IEditorInputFactoryRegistry, Extensions as EditorInputExtensions } from 'vs/workbench/common/editor';
import { Registry } from 'vs/platform/registry/common/platform';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { FILE_EDITOR_INPUT_ID } from 'vs/workbench/contrib/files/common/files';
import { FileNotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/fileNotebookInput';
import { UntitledNotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/untitledNotebookInput';
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';
import { UntitledTextEditorInput } from 'vs/workbench/services/untitled/common/untitledTextEditorInput';
import { ILanguageAssociation } from 'sql/workbench/services/languageAssociation/common/languageAssociation';
import { NotebookEditorInput } from 'sql/workbench/contrib/notebook/browser/models/notebookInput';
import { URI } from 'vs/base/common/uri';
import { IADSEditorService } from 'sql/workbench/services/queryEditor/common/adsEditorService';

const editorInputFactoryRegistry = Registry.as<IEditorInputFactoryRegistry>(EditorInputExtensions.EditorInputFactories);

export class NotebookEditorInputAssociation implements ILanguageAssociation {
	static readonly languages = ['notebook', 'ipynb'];

	constructor(
		@IADSEditorService private readonly editorService: IADSEditorService,
	) { }

	create(resource: URI): NotebookEditorInput {
		return this.editorService.createNotebookEditorInput({ resource }) as NotebookEditorInput;
	}
}

export class FileNoteBookEditorInputFactory implements IEditorInputFactory {
	serialize(editorInput: FileNotebookEditorInput): string {
		const factory = editorInputFactoryRegistry.getEditorInputFactory(FILE_EDITOR_INPUT_ID);
		if (factory) {
			return factory.serialize(editorInput.textInput as FileEditorInput); // serialize based on the underlying input
		}
		return undefined;
	}

	deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): FileNotebookEditorInput | undefined {
		const factory = editorInputFactoryRegistry.getEditorInputFactory(FILE_EDITOR_INPUT_ID);
		const fileEditorInput = factory.deserialize(instantiationService, serializedEditorInput) as FileEditorInput;
		return instantiationService.createInstance(FileNotebookEditorInput, fileEditorInput);
	}

	canSerialize(): boolean { // we can always serialize notebooks
		return true;
	}
}

export class UntitledNoteBookEditorInputFactory implements IEditorInputFactory {
	serialize(editorInput: UntitledNotebookEditorInput): string {
		const factory = editorInputFactoryRegistry.getEditorInputFactory(UntitledTextEditorInput.ID);
		if (factory) {
			return factory.serialize(editorInput.textInput); // serialize based on the underlying input
		}
		return undefined;
	}

	deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): UntitledNotebookEditorInput | undefined {
		const factory = editorInputFactoryRegistry.getEditorInputFactory(UntitledTextEditorInput.ID);
		const untitledEditorInput = factory.deserialize(instantiationService, serializedEditorInput) as UntitledTextEditorInput;
		return instantiationService.createInstance(UntitledNotebookEditorInput, untitledEditorInput);
	}

	canSerialize(): boolean { // we can always serialize notebooks
		return true;
	}
}
