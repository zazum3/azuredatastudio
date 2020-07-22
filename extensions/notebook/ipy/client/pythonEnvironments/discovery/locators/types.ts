/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { GetInterpreterOptions } from '../../../interpreter/interpreterService';

export type GetInterpreterLocatorOptions = GetInterpreterOptions & { ignoreCache?: boolean };
