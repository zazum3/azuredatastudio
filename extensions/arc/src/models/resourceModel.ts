/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ResourceInfo } from 'arc';
import * as vscode from 'vscode';
import { ControllerModel, Registration } from './controllerModel';

export abstract class ResourceModel {

	private readonly _onRegistrationUpdated = new vscode.EventEmitter<Registration>();
	public onRegistrationUpdated = this._onRegistrationUpdated.event;

	constructor(public readonly controllerModel: ControllerModel, public info: ResourceInfo, private _registration: Registration) { }

	public get registration(): Registration {
		return this._registration;
	}

	public set registration(newValue: Registration) {
		this._registration = newValue;
		this._onRegistrationUpdated.fire(this._registration);
	}

	public abstract refresh(): Promise<void>;
}
