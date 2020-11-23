const off = 0;
const warn = 1;
const error = 2;

module.exports = {
    // Stop ESLint from looking for a configuration file in parent folders
    root: true,
    plugins: ['@typescript-eslint', 'jest'],
    env: {
        browser: true,
        es2017: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
        project: ['./src/tsconfig.json', './tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
    },
    rules: {
        '@typescript-eslint/ban-types': [
            error,
            {
                extendDefaults: true,
                types: { object: false, Function: false },
            },
        ],
        '@typescript-eslint/explicit-member-accessibility': [
            error,
            {
                accessibility: 'explicit',
                overrides: {
                    constructors: 'no-public',
                },
            },
        ],
        '@typescript-eslint/explicit-module-boundary-types': [
            warn,
            { allowArgumentsExplicitlyTypedAsAny: true },
        ],
        '@typescript-eslint/no-namespace': off,
        '@typescript-eslint/no-non-null-assertion': off,
        '@typescript-eslint/no-explicit-any': off,
        '@typescript-eslint/no-unsafe-assignment': off,
        '@typescript-eslint/no-unsafe-call': off,
        '@typescript-eslint/no-unsafe-member-access': off,
        '@typescript-eslint/no-unsafe-return': off,
        '@typescript-eslint/restrict-template-expressions': off,
        curly: [error, 'multi-line'],
        'max-len': [error, { code: 95 }],
        'no-constant-condition': ['error', { checkLoops: false }],
    },
};
