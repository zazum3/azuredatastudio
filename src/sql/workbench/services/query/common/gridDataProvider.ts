/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as types from 'vs/base/common/types';
import { ITextResourcePropertiesService } from 'vs/editor/common/services/textResourceConfigurationService';
import { URI } from 'vs/base/common/uri';
import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { getErrorMessage } from 'vs/base/common/errors';
import { IClipboardService } from 'vs/platform/clipboard/common/clipboardService';
import { INotificationService } from 'vs/platform/notification/common/notification';
import { IResultSet, IFetchResponse } from 'sql/platform/query/common/queryService';
import { localize } from 'vs/nls';

export interface IGridDataProvider {

	/**
	 * Gets N rows of data
	 * @param rowStart 0-indexed start row to retrieve data from
	 * @param numberOfRows total number of rows of data to retrieve
	 */
	getRowData(rowStart: number, numberOfRows: number): Promise<IFetchResponse>;

	/**
	 * Sends a copy request to copy data to the clipboard
	 * @param selection The selection range to copy
	 * @param batchId The batch id of the result to copy from
	 * @param resultId The result id of the result to copy from
	 * @param includeHeaders [Optional]: Should column headers be included in the copy selection
	 */
	copyResults(selection: Slick.Range[], includeHeaders?: boolean): Promise<void>;

	/**
	 * Gets the EOL terminator to use for this data type.
	 */
	getEolString(): string;

	shouldIncludeHeaders(includeHeaders: boolean): boolean;

	shouldRemoveNewLines(): boolean;

	getColumnHeaders(range: Slick.Range): string[] | undefined;

	readonly canSerialize: boolean;
}

export async function getResultsString(provider: IGridDataProvider, selection: Slick.Range[], includeHeaders?: boolean): Promise<string> {
	let headers: Map<number, string> = new Map(); // Maps a column index -> header
	let rows: Map<number, Map<number, string>> = new Map(); // Maps row index -> column index -> actual row value
	const eol = provider.getEolString();

	// create a mapping of the ranges to get promises
	let tasks: (() => Promise<void>)[] = selection.map((range) => {
		return async (): Promise<void> => {
			let startCol = range.fromCell;
			let startRow = range.fromRow;

			const result = await provider.getRowData(range.fromRow, range.toRow - range.fromRow + 1);
			// If there was a previous selection separate it with a line break. Currently
			// when there are multiple selections they are never on the same line
			let columnHeaders = provider.getColumnHeaders(range);
			if (columnHeaders !== undefined) {
				let idx = 0;
				for (let header of columnHeaders) {
					headers.set(startCol + idx, header);
					idx++;
				}
			}
			// Iterate over the rows to paste into the copy string
			for (let rowIndex: number = 0; rowIndex < result.rows.length; rowIndex++) {
				let row = result.rows[rowIndex];
				let cellObjects = row.slice(range.fromCell, (range.toCell + 1));
				// Remove newlines if requested
				let cells = provider.shouldRemoveNewLines()
					? cellObjects.map(x => removeNewLines(x))
					: cellObjects.map(x => x);

				let idx = 0;
				for (let cell of cells) {
					let map = rows.get(rowIndex + startRow);
					if (!map) {
						map = new Map();
						rows.set(rowIndex + startRow, map);
					}

					map.set(startCol + idx, cell);
					idx++;
				}
			}
		};
	});

	// Set the tasks gathered above to execute
	let actionedTasks: Promise<void>[] = tasks.map(t => { return t(); });

	// Make sure all these tasks have executed
	await Promise.all(actionedTasks);

	const sortResults = (e1: [number, any], e2: [number, any]) => {
		return e1[0] - e2[0];
	};
	headers = new Map([...headers].sort(sortResults));
	rows = new Map([...rows].sort(sortResults));

	let copyString = '';
	if (includeHeaders) {
		copyString = [...headers.values()].join('\t').concat(eol);
	}

	const rowKeys = [...headers.keys()];
	for (let rowEntry of rows) {
		let rowMap = rowEntry[1];
		for (let rowIdx of rowKeys) {

			let value = rowMap.get(rowIdx);
			if (value) {
				copyString = copyString.concat(value);
			}
			copyString = copyString.concat('\t');
		}
		// Removes the tab seperator from the end of a row
		copyString = copyString.slice(0, -1 * '\t'.length);
		copyString = copyString.concat(eol);
	}
	// Removes EoL from the end of the result
	copyString = copyString.slice(0, -1 * eol.length);

	return copyString;
}


function removeNewLines(inputString: string): string {
	// This regex removes all newlines in all OS types
	// Windows(CRLF): \r\n
	// Linux(LF)/Modern MacOS: \n
	// Old MacOs: \r
	if (types.isUndefinedOrNull(inputString)) {
		return 'null';
	}

	let outputString: string = inputString.replace(/(\r\n|\n|\r)/gm, '');
	return outputString;
}

export class QueryGridDataProvider implements IGridDataProvider {

	constructor(
		private readonly resultSet: IResultSet,
		@INotificationService private _notificationService: INotificationService,
		@IClipboardService private _clipboardService: IClipboardService,
		@IConfigurationService private _configurationService: IConfigurationService,
		@ITextResourcePropertiesService private _textResourcePropertiesService: ITextResourcePropertiesService
	) {
	}

	getRowData(rowStart: number, numberOfRows: number): Promise<IFetchResponse> {
		return this.resultSet.fetch(rowStart, numberOfRows);
	}

	copyResults(selection: Slick.Range[], includeHeaders?: boolean): Promise<void> {
		return this.copyResultsAsync(selection, includeHeaders);
	}

	private async copyResultsAsync(selection: Slick.Range[], includeHeaders?: boolean): Promise<void> {
		try {
			let results = await getResultsString(this, selection, includeHeaders);
			await this._clipboardService.writeText(results);
		} catch (error) {
			this._notificationService.error(localize('copyFailed', "Copy failed with error {0}", getErrorMessage(error)));
		}
	}

	getEolString(): string {
		return getEolString(this._textResourcePropertiesService, 'query:grid');
	}

	shouldIncludeHeaders(includeHeaders: boolean): boolean {
		return shouldIncludeHeaders(includeHeaders, this._configurationService);
	}

	shouldRemoveNewLines(): boolean {
		return shouldRemoveNewLines(this._configurationService);
	}

	getColumnHeaders(range?: Slick.Range): string[] | undefined {
		if (range) {
			const mincell = Math.min(range.fromCell, range.toCell);
			const maxCell = Math.max(range.fromCell, range.toCell);
			return this.resultSet.columns.slice(mincell, maxCell + 1).map(c => c.title);
		} else {
			return this.resultSet.columns.map(c => c.title);
		}
	}

	get canSerialize(): boolean {
		return true;
	}
}


export function getEolString(textResourcePropertiesService: ITextResourcePropertiesService, uri: string): string {
	return textResourcePropertiesService.getEOL(URI.parse(uri), 'sql');
}

export function shouldIncludeHeaders(includeHeaders: boolean, configurationService: IConfigurationService): boolean {
	if (includeHeaders !== undefined) {
		// Respect the value explicity passed into the method
		return includeHeaders;
	}
	// else get config option from vscode config
	includeHeaders = configurationService.getValue<boolean>('sql.copyIncludeHeaders');
	return !!includeHeaders;
}

export function shouldRemoveNewLines(configurationService: IConfigurationService): boolean {
	// get config copyRemoveNewLine option from vscode config
	let removeNewLines = configurationService.getValue<boolean>('sql.copyRemoveNewLine');
	return !!removeNewLines;
}
