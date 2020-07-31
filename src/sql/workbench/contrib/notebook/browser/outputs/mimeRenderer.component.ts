/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IMimeComponent } from 'sql/workbench/contrib/notebook/browser/outputs/mimeRegistry';
import { AngularDisposable } from 'sql/base/browser/lifecycle';
import { ElementRef, forwardRef, Inject, Component, OnInit, Input } from '@angular/core';
import { MimeModel } from 'sql/workbench/services/notebook/browser/outputs/mimemodel';
import { INotebookService } from 'sql/workbench/services/notebook/browser/notebookService';
import { RenderMimeRegistry } from 'sql/workbench/services/notebook/browser/outputs/registry';
import { localize } from 'vs/nls';
// import * as base from '@jupyter-widgets/base';
import { WidgetManager } from 'sql/workbench/contrib/notebook/browser/outputs/widgetManager';

@Component({
	selector: MimeRendererComponent.SELECTOR,
	template: ``
})
export class MimeRendererComponent extends AngularDisposable implements IMimeComponent, OnInit {
	public static readonly SELECTOR = 'mime-output';
	private _bundleOptions: MimeModel.IOptions;
	private registry: RenderMimeRegistry;
	private _initialized: boolean = false;

	constructor(
		@Inject(forwardRef(() => ElementRef)) private el: ElementRef,
		@Inject(INotebookService) private _notebookService: INotebookService,
	) {
		super();
		this.registry = this._notebookService.getMimeRegistry();
	}

	@Input() set bundleOptions(value: MimeModel.IOptions) {
		this._bundleOptions = value;
		if (this._initialized) {
			this.renderOutput();
		}
	}

	@Input() mimeType: string;

	ngOnInit(): void {
		this.renderOutput();
		this._initialized = true;
	}

	layout(): void {
		// Re-layout the output when layout is requested
		this.renderOutput();
	}

	private renderOutput(): void {
		// TODO handle safe/unsafe mapping
		this.createRenderedMimetype(this._bundleOptions, this.el.nativeElement);
	}

	protected async createRenderedMimetype(options: MimeModel.IOptions, node: HTMLElement): Promise<void> {
		if (this.mimeType) {
			let manager: WidgetManager;
			let renderer = this.registry.createRenderer(this.mimeType);
			let kernel = this._notebookService.listNotebookEditors()[0]?.model?.clientSession?.kernel;
			if (!this._notebookService.getWidgetManager(kernel?.id)) {
				manager = new WidgetManager(kernel, node);
				this._notebookService.addWidgetManager(kernel.id, manager);
			} else {
				manager = this._notebookService.getWidgetManager(kernel.id);
			}
			if (this.mimeType === 'application/vnd.jupyter.widget-view+json') {
				let model = manager.get_model(options.data[this.mimeType]['model_id']);
				manager.updateElement(node);
				if (model !== undefined) {
					model.then(model => {
						manager.display_model(undefined, model);
					});
				}
			}
			renderer.node = node;
			let model = new MimeModel(options);
			renderer.renderModel(model).catch(error => {
				// Manually append error message to output
				renderer.node.innerHTML = `<pre>Javascript Error: ${error.message}</pre>`;
				// Remove mime-type-specific CSS classes
				renderer.node.className = 'p-Widget jp-RenderedText';
				renderer.node.setAttribute(
					'data-mime-type',
					'application/vnd.jupyter.stderr'
				);
			});
		} else {
			node.innerHTML = localize('noRendererFound',
				"No {0} renderer could be found for output. It has the following MIME types: {1}",
				options.trusted ? '' : localize('safe', "(safe) "),
				Object.keys(options.data).join(', '));
		}
	}
}
