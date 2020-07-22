/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// Added to allow compilation of backbone types pulled in from ipywidgets (@jupyterlab/widgets).
declare module JQuery {
    type TriggeredEventWidgets = any;
}
