"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const replacements = {
// '\.vscode': '.azuredatastudio',
// // 'vscode': 'azuredatastudio',
// 'VS Code': 'Azure Data Studio',
// 'HappyCoding': 'HappyAzureDataStudio',
// 'Visual Studio Code': 'Azure Data Studio',
// 'CodeSetup': 'AzureDataStudioSetup'
};
exports.transformer = (context) => (rootNode) => {
    function visit(node) {
        if (node.kind === ts.SyntaxKind.StringLiteral) {
            let stringNode = node;
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
