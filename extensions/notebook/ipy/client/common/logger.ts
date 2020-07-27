/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

// These are all just temporary aliases, for backward compatibility
// and to avoid churn.
export {
	traceDecorators,
	logError as traceError,
	logInfo as traceInfo,
	logVerbose as traceVerbose,
	logWarning as traceWarning
} from '../logging';
export { TraceOptions as LogOptions } from '../logging/trace';
