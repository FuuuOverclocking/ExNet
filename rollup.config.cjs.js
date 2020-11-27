import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
// import dts from 'rollup-plugin-dts';

const banner = (() => {
    const version = require('./package.json').version;
    const year = new Date().getFullYear();
    return (
        `/**\n` +
        ` * @license ExNet v${version}\n` +
        ` * (c) 2018-${year} X.Y.Z.\n` +
        ` * Released under the MIT License.\n` +
        ` */\n`
    );
})();

export default [
    {
        /* core input options */
        external: [],
        input: './build/tsesm/exnet.dev.js',
        plugins: [
            nodeResolve(),
            sourcemaps(),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development'),
            }),
            json(),
        ],
        output: {
            /* core output options */
            dir: './build/cjs',
            format: 'cjs',
            globals: [],

            /* advanced output options */
            banner,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            treeshake: false,
        },
    },
    {
        /* core input options */
        external: [],
        input: './build/tsesm/exnet.prod.js',
        plugins: [
            nodeResolve(),
            sourcemaps(),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            json(),
        ],
        output: {
            /* core output options */
            dir: './build/cjs',
            format: 'cjs',
            globals: [],

            /* advanced output options */
            banner,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            treeshake: false,
        },
    },
    // {
    //     /* core input options */
    //     external: [],
    //     input: './build/tsesm/exnet.dev.d.ts',
    //     plugins: [dts()],
    //     output: {
    //         /* core output options */
    //         file: './build/cjs/exnet.d.ts',
    //         format: 'es',
    //     },
    // },
];
