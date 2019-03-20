import * as ts from 'typescript';

const replacements: { [key: string]: string } = {
	// '\.vscode': '.azuredatastudio',
	// // 'vscode': 'azuredatastudio',
	// 'VS Code': 'Azure Data Studio',
	// 'HappyCoding': 'HappyAzureDataStudio',
	// 'Visual Studio Code': 'Azure Data Studio',
	// 'CodeSetup': 'AzureDataStudioSetup'
};

export const transformer = <T extends ts.Node>(context: ts.TransformationContext) =>
        (rootNode: T) => {
    function visit(node: ts.Node): ts.Node {
        if (node.kind === ts.SyntaxKind.StringLiteral) {
			let stringNode = node as ts.StringLiteral;
			let string = stringNode.text;
			for (let key in replacements) {
				let regex = new RegExp(key, 'g');
				string = string.replace(regex, replacements[key]);
			}
			if (string !== stringNode.text) {
				console.log('Replaced "', stringNode.text, '" with "', string, ' "');
			}
			return ts.createLiteral(string);
        }
        return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
};
