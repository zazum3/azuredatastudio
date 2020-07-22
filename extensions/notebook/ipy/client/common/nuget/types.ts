/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import { SemVer } from 'semver';
import { Resource } from '../types';
export type NugetPackage = { package: string; version: SemVer; uri: string };

export const INugetService = Symbol('INugetService');
export interface INugetService {
	isReleaseVersion(version: SemVer): boolean;
	getVersionFromPackageFileName(packageName: string): SemVer;
}

export const INugetRepository = Symbol('INugetRepository');
export interface INugetRepository {
	getPackages(packageName: string, resource: Resource): Promise<NugetPackage[]>;
}
