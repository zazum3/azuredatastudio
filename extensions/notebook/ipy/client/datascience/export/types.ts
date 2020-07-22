/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken, Uri } from 'vscode';
import { INotebookModel } from '../types';

export enum ExportFormat {
	pdf = 'pdf',
	html = 'html',
	python = 'python'
}

export const IExportManager = Symbol('IExportManager');
export interface IExportManager {
	export(format: ExportFormat, model: INotebookModel, defaultFileName?: string): Promise<undefined>;
}

export const IExport = Symbol('IExport');
export interface IExport {
	export(source: Uri, target: Uri, token: CancellationToken): Promise<void>;
}

export const IExportManagerFilePicker = Symbol('IExportManagerFilePicker');
export interface IExportManagerFilePicker {
	getExportFileLocation(format: ExportFormat, source: Uri, defaultFileName?: string): Promise<Uri | undefined>;
}
