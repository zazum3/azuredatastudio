/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* eslint-disable code-import-patterns */

import * as base from '@jupyter-widgets/base';

import { nb } from 'azdata';
import { HTMLManager } from '@jupyter-widgets/html-manager';

export class WidgetManager extends HTMLManager {
	constructor(kernel: nb.IKernel) {
		super();
		this.kernel = kernel;

		kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
			const oldComm = new base.shims.services.Comm(comm);
			await this.handle_comm_open(oldComm, msg);
		});
	}


	/**
	 * Create a comm.
	 */
	async _create_comm(
		target_name: string,
		model_id: string,
		data?: any,
		metadata?: any
	): Promise<base.shims.services.Comm> {
		const comm = this.kernel.createComm(target_name, model_id);
		if (data || metadata) {
			comm.open(data, metadata);
		}
		return Promise.resolve(new base.shims.services.Comm(comm));
	}

	/**
	 * Get the currently-registered comms.
	 */
	_get_comm_info(): Promise<any> {
		return this.kernel
			.requestCommInfo({ target_name: this.comm_target_name })
			.then((reply: { content: any; }) => (reply.content as any).comms);
	}

	kernel: nb.IKernel;
}
