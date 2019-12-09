/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IModelStore, IComponentDescriptor, IComponent } from './interfaces';
import { Deferred } from 'sql/base/common/promise';
import { entries } from 'sql/base/common/collections';
import { find } from 'vs/base/common/arrays';
import { onUnexpectedError } from 'vs/base/common/errors';

class ComponentDescriptor implements IComponentDescriptor {
	constructor(public readonly id: string, public readonly type: string) {

	}
}

export class ModelStore implements IModelStore {

	private _descriptorMappings: { [x: string]: IComponentDescriptor } = {};
	private _componentMappings: { [x: string]: IComponent } = {};
	private _componentActions: { [x: string]: Deferred<IComponent>[] } = {};
	private _validationCallbacks: ((componentId: string) => Thenable<boolean>)[] = [];
	constructor() {
	}

	public createComponentDescriptor(type: string, id: string): IComponentDescriptor {
		let descriptor = new ComponentDescriptor(id, type);
		this._descriptorMappings[id] = descriptor;
		return descriptor;
	}

	getComponentDescriptor(id: string): IComponentDescriptor {
		return this._descriptorMappings[id];
	}

	registerComponent(component: IComponent): void {
		let id = component.descriptor.id;
		this._componentMappings[id] = component;
		this.runPendingActions(id, component).catch(err => onUnexpectedError(err));
	}

	unregisterComponent(component: IComponent): void {
		let id = component.descriptor.id;
		this._componentMappings[id] = undefined;
		this._componentActions[id] = undefined;
		this._descriptorMappings[id] = undefined;
		// TODO notify model for cleanup
	}

	getComponent(componentId: string): IComponent {
		return this._componentMappings[componentId];
	}

	eventuallyRunOnComponent<T>(componentId: string, action: (component: IComponent) => T): Promise<T> {
		let component = this.getComponent(componentId);
		// Immediately resolve if we have the component registered already and don't have any
		// pending promises
		if (component && !this._componentActions[componentId]) {
			return Promise.resolve(action(component));
		} else {
			return this.addPendingAction(componentId, action);
		}
	}

	registerValidationCallback(callback: (componentId: string) => Thenable<boolean>): void {
		this._validationCallbacks.push(callback);
	}

	validate(component: IComponent): Thenable<boolean> {
		let componentId = find(entries(this._componentMappings), ([id, mappedComponent]) => component === mappedComponent)[0];
		return Promise.all(this._validationCallbacks.map(callback => callback(componentId))).then(validations => validations.every(validation => validation === true));
	}

	private addPendingAction<T>(componentId: string, action: (component: IComponent) => T): Promise<T> {
		// We create a promise and chain it onto a tracking promise whose resolve method
		// will only be called once the component is created
		let promises = this._componentActions[componentId];
		if (!promises) {
			this._componentActions[componentId] = [];
			promises = this._componentActions[componentId];
		}
		const deferred = new Deferred<IComponent>();
		const promise = deferred.then((component) => {
			return action(component);
		});
		promises.push(deferred);
		return promise;
	}

	private async runPendingActions(componentId: string, component: IComponent): Promise<void> {
		let promiseMappings = this._componentActions[componentId];
		if (promiseMappings) {
			while (promiseMappings.length > 0) {
				const deferred = promiseMappings.splice(0, 1)[0];
				deferred.resolve(component);
				await deferred.promise;
			}
		}
		this._componentActions[componentId] = undefined;
	}
}
