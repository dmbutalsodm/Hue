module.exports = {
    "extends": "./node_modules/eslint-config-google/index.js",
    "parserOptions": {
        "ecmaVersion": 2017
    },
    "rules": {
        'linebreak-style': 'off',
        "require-jsdoc": ["error", {
            "require": {
                "FunctionDeclaration": true,
                "MethodDefinition": true,
                "ClassDeclaration": false,
                "ArrowFunctionExpression": false,
                "FunctionExpression": false
            }
        }],
        "max-len": 'off'
    }
};