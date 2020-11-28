import { nodeResolve } from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';

const banner = (() => {
    const version = require('./package.json').version;
    const year = new Date().getFullYear();
    return (
        `/**\n` +
        ` * @license\n` +
        ` * ExNet v${version}\n` +
        ` * (c) 2018-${year} X.Y.Z.\n` +
        ` * Released under the MIT License.\n` +
        ` */\n`
    );
})();

export default [
    // dev
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
            file: './build/umd/exnet.dev.umd.js',
            format: 'umd',
            globals: [],
            name: 'exnet',

            /* advanced output options */
            banner,
            extend: false,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            amd: {
                id: 'exnet',
            },
            treeshake: false,
        },
    },
    // dev, comps
    {
        /* core input options */
        external: [],
        input: './build/tsesm/exnet.dev.comps.umd.js',
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
            file: './build/umd/exnet.dev.comps.umd.js',
            format: 'umd',
            globals: [],
            name: 'exnet',

            /* advanced output options */
            banner,
            extend: false,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            amd: {
                id: 'exnet',
            },
            treeshake: false,
        },
    },
    // prod
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
            file: './build/umd/exnet.prod.umd.js',
            format: 'umd',
            globals: [],
            name: 'exnet',

            /* advanced output options */
            banner,
            extend: false,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            amd: {
                id: 'exnet',
            },
            treeshake: false,
        },
    },
    // prod, comps
    {
        /* core input options */
        external: [],
        input: './build/tsesm/exnet.prod.comps.umd.js',
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
            file: './build/umd/exnet.prod.comps.umd.js',
            format: 'umd',
            globals: [],
            name: 'exnet',

            /* advanced output options */
            banner,
            extend: false,
            interop: 'esModule',
            sourcemap: true,
            sourcemapExcludeSources: false,
            // sourcemapFile,
            // sourcemapPathTransform,

            /* danger zone */
            amd: {
                id: 'exnet',
            },
            treeshake: false,
        },
    },
];
