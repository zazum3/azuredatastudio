/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

export enum CssMessages {
	GetCssRequest = 'get_css_request',
	GetCssResponse = 'get_css_response',
	GetMonacoThemeRequest = 'get_monaco_theme_request',
	GetMonacoThemeResponse = 'get_monaco_theme_response'
}

export enum SharedMessages {
	UpdateSettings = 'update_settings',
	Started = 'started',
	LocInit = 'loc_init',
	StyleUpdate = 'style_update'
}

export interface IGetCssRequest {
	isDark: boolean;
}

export interface IGetMonacoThemeRequest {
	isDark: boolean;
}

export interface IGetCssResponse {
	css: string;
	theme: string;
	knownDark?: boolean;
}
