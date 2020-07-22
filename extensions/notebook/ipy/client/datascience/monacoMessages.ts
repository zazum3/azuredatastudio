/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
import * as monacoEditor from 'monaco-editor';

export interface IGetMonacoThemeResponse {
	theme: monacoEditor.editor.IStandaloneThemeData;
}
