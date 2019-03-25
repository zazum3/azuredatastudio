"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const replacements = {
    // '^\.vscode': '.azuredatastudio',
    // // 'vscode': 'azuredatastudio',
    'VS Code': 'Azure Data Studio',
    'HappyCoding': 'HappyAzureDataStudio',
    'Visual Studio Code': 'Azure Data Studio',
    'CodeSetup': 'AzureDataStudioSetup'
};
exports.transformer = (context) => (rootNode) => {
    function visit(node) {
        if (ts.isStringLiteralLike(node)) {
            let string = node.text;
            for (let key in replacements) {
                let regex = new RegExp(key, 'g');
                string = string.replace(regex, replacements[key]);
            }
            if (string !== node.text) {
                console.log('Replaced "', node.text, '" with "', string, ' "');
            }
            return ts.createStringLiteral(string);
        }
        return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
};
