/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from 'vs/platform/instantiation/common/instantiation';
import { IEditorOptions } from 'vs/platform/editor/common/editor';
import { IResourceEditorInputType } from 'vs/workbench/services/editor/common/editorService';
import { IEditorInput } from 'vs/workbench/common/editor';

export interface IQueryEditorOptions extends IEditorOptions {

	// Tells IQueryEditorService.queryEditorCheck to not open this input in the QueryEditor.
	// Used when the user changes the Language Mode to not-SQL for files with .sql extensions.
	denyQueryEditor?: boolean;
}

export const IADSEditorService = createDecorator<IADSEditorService>('ADSEditorService');

export interface IADSEditorService {

	_serviceBrand: undefined;

	// Creates new untitled document for SQL queries and opens it in a new editor tab
	createNotebookEditorInput(input: IResourceEditorInputType): IEditorInput;
	createQueryEditorInput(input: IResourceEditorInputType): IEditorInput;
}
