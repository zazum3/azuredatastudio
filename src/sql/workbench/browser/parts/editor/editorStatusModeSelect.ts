/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ServicesAccessor } from 'vs/platform/instantiation/common/instantiation';
import { IModeSupport, IEditorInput } from 'vs/workbench/common/editor';
import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { getCodeEditor } from 'vs/editor/browser/editorBrowser';
import { Registry } from 'vs/platform/registry/common/platform';
import { ILanguageAssociationRegistry, Extensions as LanguageAssociationExtensions } from 'sql/workbench/services/languageAssociation/common/languageAssociation';
import { IEditorGroupsService } from 'vs/workbench/services/editor/common/editorGroupsService';

const languageAssociationRegistry = Registry.as<ILanguageAssociationRegistry>(LanguageAssociationExtensions.LanguageAssociations);

/**
 * Handles setting a mode from the editor status and converts inputs if necessary
 */
export async function setMode(accessor: ServicesAccessor, modeSupport: IModeSupport, activeEditor: IEditorInput, language: string): Promise<void> {
	const editorService = accessor.get(IEditorService);
	const activeWidget = getCodeEditor(editorService.activeTextEditorControl);
	const activeControl = editorService.activeEditorPane;
	const textModel = activeWidget.getModel();
	const oldLanguage = textModel.getLanguageIdentifier().language;
	const editorGroupService = accessor.get(IEditorGroupsService);

	if (language !== oldLanguage) {
		const creator = languageAssociationRegistry.getAssociationForLanguage(language); // who knows how to handle the requested language
		const oldCreator = languageAssociationRegistry.getAssociationForLanguage(oldLanguage);

		modeSupport.setMode(language);

		let newInput: IEditorInput | undefined;

		if (creator) { // if we know how to handle the new language, tranform the input and replace the editor (e.x notebook, sql, etc)
			newInput = await creator.create(activeEditor.resource);
		} else if (oldCreator) {
			newInput = editorService.createEditorInput({ resource: activeEditor.resource, mode: language });
		}

		if (newInput) {  // the factory will return undefined if it doesn't know how to handle the input
			await editorService.replaceEditors([{ editor: activeEditor, replacement: newInput }], activeControl.group);
		}
	}
}
