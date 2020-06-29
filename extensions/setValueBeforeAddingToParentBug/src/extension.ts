/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import * as azdata from 'azdata';

export async function activate(_: vscode.ExtensionContext): Promise<void> {
	const dashboard = azdata.window.createModelViewDashboard('Bug');
	dashboard.registerTabs(async (view: azdata.ModelView) => {
		return [getTab(view)];
	});
	dashboard.open();
}

function getTab(view: azdata.ModelView): azdata.DashboardTab {
	const root = view.modelBuilder.divContainer().component();
	root.addItem(divBefore(view));
	root.addItem(divAfter(view));

	return {
		title: 'Bug repro',
		id: 'Bug repro',
		content: root
	};
}

function divBefore(view: azdata.ModelView): azdata.Component {
	const div = view.modelBuilder.divContainer().component();
	const text = view.modelBuilder.text().component();
	text.value = 'Initial value';

	text.value = 'Set value before adding to div';
	div.addItem(text);
	return div;
}

function divAfter(view: azdata.ModelView) {
	const div = view.modelBuilder.divContainer().component();
	const text = view.modelBuilder.text().component();
	text.value = 'Initial value';

	div.addItem(text);
	text.value = 'Set value after adding to div'; // Doesn't work
	return div;
}

// Happens with loading components too
/*
function loadingComponentBefore(view: azdata.ModelView): azdata.Component {
	const text = view.modelBuilder.text().component();
	const loading = view.modelBuilder.loadingComponent().component();
	loading.loading = false;
	text.value = "Initial value";

	text.value = "Set value before adding to loading component";
	loading.component = text;
	return loading;
}

function loadingComponentAfter(view: azdata.ModelView): azdata.Component {
	const text = view.modelBuilder.text().component();
	const loading = view.modelBuilder.loadingComponent().component();
	loading.loading = false;
	text.value = "Initial value";

	loading.component = text;
	text.value = "Set value after adding to loading component";
	return loading;
}
*/
