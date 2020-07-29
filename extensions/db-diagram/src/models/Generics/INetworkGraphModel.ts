/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import INodeModel from './INodeModel';


export default interface INetworkGraphModel {
	name: string;
	summary: string;
	nodes: Map<string, INodeModel>;
	metadata: JSON;

}
