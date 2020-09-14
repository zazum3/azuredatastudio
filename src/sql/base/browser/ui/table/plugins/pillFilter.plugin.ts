/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/pillFilter';
import { append, $, addStandardDisposableListener } from 'vs/base/browser/dom';
import { Emitter, Event } from 'vs/base/common/event';

export interface IPillFilterOptions extends Slick.PluginOptions {

}

export type PillFilterClause = { key: string, operator: string, value: string };

export class PillFilter<T extends Slick.SlickData> implements Slick.Plugin<T> {

	private _filters: PillFilterClause[] = [];

	private _onFilterClausesUpdated: Emitter<void> = new Emitter<void>();
	public onFilterClausesUpdate: Event<void> = this._onFilterClausesUpdated.event;

	public init(grid: Slick.Grid<T>) {
		const container = grid.getContainerNode();
		const filterContainer = $('div.pill-filter-container');
		[{ key: 'c1', operator: '==', value: 'c1.1' },
		{ key: 'c2', operator: '==', value: 'c2.2' },
		{ key: 'c3', operator: '==', value: 'c3.1' }].forEach(filterClause => {
			const pill = append(filterContainer, $('div.pill-filter'));
			pill.style.borderColor = '#015cda';
			pill.style.backgroundColor = '#b3d7f2';
			const pillInnerContent = append(pill, $('div.pill-inner-content'));
			const key = append(pillInnerContent, $('span.pill-content-key'));
			key.innerText = filterClause.key;
			const operator = append(pillInnerContent, $('span.pill-content-operator'));
			operator.innerText = filterClause.operator;
			const value = append(pillInnerContent, $('span.pill-content-value'));
			value.innerText = filterClause.value;
			filterContainer.appendChild(pill);
			addStandardDisposableListener(pill, 'click', e => {
				this.addFilterClause(filterClause);
			});
		});
		container.insertBefore(filterContainer, container.childNodes[0]);
	}

	private addFilterClause(filterClause: PillFilterClause): void {
		this._filters.push(filterClause);
		this._onFilterClausesUpdated.fire();
	}

	public filter(data: Array<T>): Array<T> {
		if (this._filters.length === 0) {
			return data;
		}

		return data.filter(item => {
			const matchedFilter = this._filters.find(filter => {
				if (item[filter.key] === filter.value) {
					return true;
				}
				return false;
			});
			return !!matchedFilter;
		});
	}

	public destroy() {

	}
}
