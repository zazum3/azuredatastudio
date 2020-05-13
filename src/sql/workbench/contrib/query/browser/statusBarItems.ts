/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IEditorService } from 'vs/workbench/services/editor/common/editorService';
import { IntervalTimer } from 'vs/base/common/async';
import { Disposable, DisposableStore, IDisposable } from 'vs/base/common/lifecycle';
import { IWorkbenchContribution } from 'vs/workbench/common/contributions';
import { localize } from 'vs/nls';
import { parseNumAsTimeString } from 'sql/platform/connection/common/utils';
import { Event } from 'vs/base/common/event';
import { QueryEditorInput } from 'sql/workbench/common/editor/query/queryEditorInput';
import { IStatusbarService, IStatusbarEntryAccessor, StatusbarAlignment } from 'vs/workbench/services/statusbar/common/statusbar';
import { IQuery, QueryState } from 'sql/platform/query/common/queryService';
import { isNumber } from 'vs/base/common/types';

export class TimeElapsedStatusBarContributions extends Disposable implements IWorkbenchContribution {

	private static readonly ID = 'status.query.timeElapsed';

	private statusItem: IStatusbarEntryAccessor;
	private intervalTimer = new IntervalTimer();

	private disposable = this._register(new DisposableStore());

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IEditorService private readonly editorService: IEditorService
	) {
		super();
		this.statusItem = this._register(
			this.statusbarService.addEntry({
				text: '',
				ariaLabel: ''
			},
				TimeElapsedStatusBarContributions.ID,
				localize('status.query.timeElapsed', "Time Elapsed"),
				StatusbarAlignment.RIGHT, 100)
		);

		this._register(editorService.onDidActiveEditorChange(this.update, this));
		this.update();
	}

	private hide() {
		this.statusbarService.updateEntryVisibility(TimeElapsedStatusBarContributions.ID, false);
	}

	private show() {
		this.statusbarService.updateEntryVisibility(TimeElapsedStatusBarContributions.ID, true);
	}

	private update() {
		this.intervalTimer.cancel();
		this.disposable.clear();
		this.hide();
		const activeInput = this.editorService.activeEditor;
		if (activeInput && activeInput instanceof QueryEditorInput && activeInput.uri) {
			const query = activeInput.query;
			this.disposable.add(query.onDidStateChange(e => {
				this._displayValue(query);
			}));
			this._displayValue(query);
		}
	}

	private _displayValue(query: IQuery) {
		this.intervalTimer.cancel();
		if (query.state === QueryState.EXECUTING) {
			const update = () => {
				const timeString = parseNumAsTimeString(Date.now() - query.startTime, false);
				this.statusItem.update({
					text: timeString,
					ariaLabel: timeString
				});
			};

			this.intervalTimer.cancelAndSet(() => update(), 1000);
			update();
			this.show();
		} else if (isNumber(query.startTime) && isNumber(query.endTime)) {
			const timeString = parseNumAsTimeString(query.endTime - query.startTime, false);
			this.statusItem.update({
				text: timeString,
				ariaLabel: timeString
			});
			this.show();
		}
	}
}

export class RowCountStatusBarContributions extends Disposable implements IWorkbenchContribution {

	private static readonly ID = 'status.query.rowCount';

	private statusItem: IStatusbarEntryAccessor;

	private disposable = this._register(new DisposableStore());

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IEditorService private readonly editorService: IEditorService
	) {
		super();
		this.statusItem = this._register(
			this.statusbarService.addEntry({
				text: '',
				ariaLabel: ''
			},
				RowCountStatusBarContributions.ID,
				localize('status.query.rowCount', "Row Count"),
				StatusbarAlignment.RIGHT, 100)
		);

		this._register(editorService.onDidActiveEditorChange(this.update, this));
		this.update();
	}

	private hide() {
		this.statusbarService.updateEntryVisibility(RowCountStatusBarContributions.ID, false);
	}

	private show() {
		this.statusbarService.updateEntryVisibility(RowCountStatusBarContributions.ID, true);
	}

	private update() {
		this.disposable.clear();
		this.hide();
		const activeInput = this.editorService.activeEditor;
		if (activeInput && activeInput instanceof QueryEditorInput && activeInput.uri) {
			const query = activeInput.query;
			this.disposable.add(Event.any(query.onDidStateChange, query.onResultSetAvailable, query.onResultSetUpdated)(() => {
				this._displayValue(query);
			}));
			this._displayValue(query);
		}
	}

	private _displayValue(query: IQuery) {
		const rowCount = query.resultSets.reduce((p, c) => p + c.rowCount, 0);
		const text = localize('rowCount', "{0} rows", rowCount.toLocaleString());
		this.statusItem.update({ text, ariaLabel: text });
		this.show();
	}
}

export class QueryStatusStatusBarContributions extends Disposable implements IWorkbenchContribution {

	private static readonly ID = 'status.query.status';

	private disposable?: IDisposable;

	constructor(
		@IStatusbarService private readonly statusbarService: IStatusbarService,
		@IEditorService private readonly editorService: IEditorService
	) {
		super();
		this._register(
			this.statusbarService.addEntry({
				text: localize('query.status.executing', "Executing query..."),
				ariaLabel: localize('query.status.executing', "Executing query...")
			},
				QueryStatusStatusBarContributions.ID,
				localize('status.query.status', "Execution Status"),
				StatusbarAlignment.RIGHT, 100)
		);

		this._register(this.editorService.onDidActiveEditorChange(this.onEditorChange, this));
		this.onEditorChange();
	}

	private onEditorChange() {
		if (this.disposable) {
			this.disposable.dispose();
			this.disposable = undefined;
		}
		const activeInput = this.editorService.activeEditor;
		if (activeInput instanceof QueryEditorInput) {
			const query = activeInput.query;
			query.onDidStateChange(e => this.update(e));
			this.update(query.state);
		}
	}

	private update(state: QueryState) {
		this.hide();
		if (state === QueryState.EXECUTING) {
			this.show();
		}
	}

	private hide() {
		this.statusbarService.updateEntryVisibility(QueryStatusStatusBarContributions.ID, false);
	}

	private show() {
		this.statusbarService.updateEntryVisibility(QueryStatusStatusBarContributions.ID, true);
	}
}
