const off = 0;
const error = 2;

module.exports = {
    // Stop ESLint from looking for a configuration file in parent folders
    root: true,
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    overrides: [
        {
            files: ['scripts/**/*.js', 'tests/jest.config.js', '.eslintrc.js'],
            parserOptions: {
                ecmaVersion: 2017,
                sourceType: 'script',
            },
            extends: [
                'eslint:recommended',
                'prettier',
                'prettier/@typescript-eslint',
            ],
        },
        {
            files: 'rollup.*.js',
            parserOptions: {
                ecmaVersion: 2017,
                sourceType: 'module',
            },
            extends: [
                'eslint:recommended',
                'prettier',
                'prettier/@typescript-eslint',
            ],
        },
        {
            files: 'src/**/*.ts',
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint', 'jest'],
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:@typescript-eslint/recommended-requiring-type-checking',
                'plugin:jest/recommended',
                'prettier',
                'prettier/@typescript-eslint',
            ],
            parserOptions: {
                tsconfigRootDir: __dirname,
                ecmaVersion: 2015,
                sourceType: 'module',
                project: ['./tsconfig.cjs.json'],
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
                    error,
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
        },
    ],
};
