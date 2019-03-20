

declare module "gulp-tsb" {

	export interface ICancellationToken {
		isCancellationRequested(): boolean;
	}

	export interface IncrementalCompiler {
		(token?:ICancellationToken): NodeJS.ReadWriteStream;
		// program?: ts.Program;
	}

	export function create(configOrName: { [option: string]: string | number | boolean; } | string, customTransformers?: { before?: any[], after?: any[] }, verbose?: boolean, json?: boolean, onError?: (message: any) => void): IncrementalCompiler;

}
