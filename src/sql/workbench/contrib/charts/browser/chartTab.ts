/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IPanelTab } from 'sql/base/browser/ui/panel/panel';
import { ChartView } from './chartView';

import { localize } from 'vs/nls';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IQuery } from 'sql/platform/query/common/queryService';

export class ChartTab implements IPanelTab {
	public readonly title = localize('chartTabTitle', "Chart");
	public readonly identifier = 'ChartTab';
	public readonly view: ChartView;

	constructor(@IInstantiationService instantiationService: IInstantiationService) {
		this.view = instantiationService.createInstance(ChartView, true);
	}

	public set query(query: IQuery) {
		this.view.query = query;
	}

	public chart(id: string): void {
		this.view.chart(id);
	}

	public dispose() {
		this.view.dispose();
	}

	public clear() {
		this.view.clear();
	}
}
