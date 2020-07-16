/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const rimraf = require('rimraf');
const path = require('path');

rimraf.sync(path.join(__dirname, '..', '..', '..', 'out', 'ipywidgets'));
