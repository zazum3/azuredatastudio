/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export type EngineSettingsModel = {
	parameterName: string | undefined,
	value: string | undefined,
	description: string | undefined,
	min: string | undefined,
	max: string | undefined,
	options: string | undefined,
	type: string | undefined
};

export class EngineSettingsData {

	constructor() { }

	public getLargeData(): EngineSettingsModel[] {
		let engineSettings: EngineSettingsModel[] = [];
		for (let i = 0; i < 15; i++) {
			this.getSmallData().forEach(param => { engineSettings.push(param); });
		}

		return engineSettings;
	}

	public getSmallData(): EngineSettingsModel[] {
		return [
			{
				parameterName: 'allow_system_table_mods',
				value: 'off',
				description: 'Allows modifications of the structure of system tables.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'bool',
			},
			{
				parameterName: 'application_name',
				value: 'NULL',
				description: 'Sets the application name to be reported in statistics and logs.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'string',
			},
			{
				parameterName: 'archive_cleanup_command',
				value: 'NULL',
				description: 'Sets the shell command that will be executed at every restart point.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'string',
			},
			{
				parameterName: 'archive_command',
				value: '/usr/local/bin/dusky-archive backup \"/mnt/db-backups/0c4446bfb432448ba9c14d1d51e70c6a.0/wals/\" \"%p\" \"%f\" >/tmp/pg-archive.log 2>&1',
				description: 'Sets the shell command that will be called to archive a WAL file.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'string',
			},
			{
				parameterName: 'archive_mode',
				value: 'on',
				description: 'Allows archiving of WAL files using archive_command.',
				min: 'NULL',
				max: 'NULL',
				options: '[\"always\", \"on\", \"off\"]',
				type: 'enum',
			},
			{
				parameterName: 'archive_timeout',
				value: '14400',
				description: 'Forces a switch to the next WAL file if a new file has not been started within N seconds.',
				min: '0',
				max: '1073741823',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'array_nulls',
				value: 'on',
				description: 'Enable input of NULL elements in arrays.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'bool',
			},
			{
				parameterName: 'authentication_timeout',
				value: '60',
				description: 'Sets the maximum allowed time to complete client authentication.',
				min: '1',
				max: '600',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum',
				value: 'on',
				description: 'Starts the autovacuum subprocess.',
				min: 'NULL',
				max: 'NULL',
				options: 'NULL',
				type: 'bool',
			},
			{
				parameterName: 'autovacuum_analyze_scale_factor',
				value: '0.1',
				description: 'Number of tuple inserts, updates, or deletes prior to analyze as a fraction of reltuples.',
				min: '0',
				max: '100',
				options: 'NULL',
				type: 'real',
			},
			{
				parameterName: 'autovacuum_analyze_threshold',
				value: '50',
				description: 'Minimum number of tuple inserts, updates, or deletes prior to analyze.',
				min: '0',
				max: '2147483647',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_freeze_max_age',
				value: '200000000',
				description: 'Age at which to autovacuum a table to prevent transaction ID wraparound.',
				min: '100000',
				max: '2000000000',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_max_workers',
				value: '3',
				description: 'Sets the maximum number of simultaneously running autovacuum worker processes.',
				min: '1',
				max: '262143',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_multixact_freeze_max_age',
				value: '400000000',
				description: 'Multixact age at which to autovacuum a table to prevent multixact wraparound.',
				min: '10000',
				max: '2000000000',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_naptime',
				value: '60',
				description: 'Time to sleep between autovacuum runs.',
				min: '1',
				max: '2147483',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_vacuum_cost_delay',
				value: '0',
				description: 'Vacuum cost delay in milliseconds, for autovacuum.',
				min: '-1',
				max: '100',
				options: 'NULL',
				type: 'real',
			},
			{
				parameterName: 'autovacuum_vacuum_cost_limit',
				value: '-1',
				description: 'Vacuum cost amount available before napping, for autovacuum.',
				min: '-1',
				max: '10000',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_vacuum_scale_factor',
				value: '0.2',
				description: 'Number of tuple updates or deletes prior to vacuum as a fraction of reltuples.',
				min: '0',
				max: '100',
				options: 'NULL',
				type: 'real',
			},
			{
				parameterName: 'autovacuum_vacuum_threshold',
				value: '50',
				description: 'Minimum number of tuple updates or deletes prior to vacuum.',
				min: '0',
				max: '2147483647',
				options: 'NULL',
				type: 'integer',
			},
			{
				parameterName: 'autovacuum_work_mem',
				value: '-1',
				description: 'Sets the maximum memory to be used by each autovacuum worker process.',
				min: '-1',
				max: '2147483647',
				options: 'NULL',
				type: 'integer',
			},
		];
	}
}
