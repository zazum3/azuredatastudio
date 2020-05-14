/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { QueryEditorInput } from 'sql/workbench/common/editor/query/queryEditorInput';
import { IConnectionManagementService } from 'sql/platform/connection/common/connectionManagement';
import { IQueryModelService } from 'sql/workbench/services/query/common/queryModel';

import { IConfigurationService } from 'vs/platform/configuration/common/configuration';
import { EncodingMode, IMoveResult, GroupIdentifier } from 'vs/workbench/common/editor';
import { URI } from 'vs/base/common/uri';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IEditorModel } from 'vs/platform/editor/common/editor';
import { FileEditorInput } from 'vs/workbench/contrib/files/common/editors/fileEditorInput';

export class FileQueryEditorInput extends QueryEditorInput {

	public static readonly ID = 'workbench.editorInput.fileQueryInput';

	constructor(
		input: FileEditorInput,
		description: string | undefined,
		@IConnectionManagementService connectionManagementService: IConnectionManagementService,
		@IQueryModelService queryModelService: IQueryModelService,
		@IConfigurationService configurationService: IConfigurationService,
		@IInstantiationService instantiationService: IInstantiationService
	) {
		super(input, description, connectionManagementService, queryModelService, configurationService, instantiationService);
	}

	public resolve(): Promise<IEditorModel> {
		return this.text.resolve();
	}

	public get text(): FileEditorInput {
		return this._text as FileEditorInput;
	}

	public getTypeId(): string {
		return FileQueryEditorInput.ID;
	}

	public getEncoding(): string {
		return this.text.getEncoding();
	}

	public setEncoding(encoding: string, mode: EncodingMode) {
		this.text.setEncoding(encoding, mode);
	}

	public setPreferredEncoding(encoding: string) {
		this.text.setPreferredEncoding(encoding);
	}

	public setMode(mode: string) {
		this.text.setMode(mode);
	}

	public setPreferredMode(mode: string) {
		this.text.setPreferredMode(mode);
	}

	public setForceOpenAsBinary() {
		this.text.setForceOpenAsBinary();
	}

	public isResolved(): boolean {
		return this.text.isResolved();
	}

	public move(group: GroupIdentifier, target: URI): IMoveResult {
		return this.text.move(group, target);
	}
}
