const fs = require('fs-extra');
const moment = require('moment');
const chalk = require('chalk');
const { bold, cyan, black } = chalk;
const globby = require('globby');
const {
    cliArgs,
    paths,
    echo,
    getExNetVersion,
    execSilently,
    getPromise,
} = require('./utilities');
require('draftlog').into(console);

process.on('unhandledRejection', (reason) => {
    echo();
    echo('Unhandled rejection:');
    echo(reason);
    process.exit(1);
});

setImmediate(main);

async function main() {
    if (cliArgs.length === 0) {
        await build.main({});
        return;
    }
    if (cliArgs.length === 1) {
        switch (cliArgs[0]) {
            case '--make-package':
                await build.main({ makePackage: true });
                return;
            case '--tscjs-only':
                await build.main({ tscjsOnly: true });
                return;
        }
    }
    throw new Error('Invalid CLI arguments.');
}

const build = {
    timeBegin: undefined,
    tasksLeft: undefined,
    onTaskFinish: undefined,
    tasks: undefined,
    prompt: undefined,

    async main(options) {
        build.timeBegin = Date.now();
        build.prompt.show();

        const { promise, resolve } = getPromise();

        build.onTaskFinish = () => {
            build.tasksLeft--;
            build.prompt.updateStatus();
            if (build.tasksLeft === 0) resolve();
        };

        const tasks = build.tasks;

        if (options.tscjsOnly) {
            build.tasksLeft = 2;

            tasks.clean().then(() => {
                tasks.tsCJS();
            });
        } else if (options.makePackage) {
            build.tasksLeft = 4;

            tasks.cleanRelease().then(() => {
                tasks.copyReleaseFiles().then(() => {
                    tasks.generatePathMapping();
                    tasks.correctMapSources();
                });
            });
        } else {
            build.tasksLeft = 12;

            tasks.clean().then(() => {
                tasks.tsESM().then(() => {
                    tasks.rollupCJS();
                    tasks.rollupESM();
                    tasks.rollupUMD().then(() => {
                        tasks.compressUmdNoComp();
                        tasks.compressUmdComp();
                    });
                    tasks.copyCompsFromTsesm();
                    tasks.copyDtsFromTsesm();
                });
                tasks.copyAutoCJS();
                tasks.tsCJS().then(() => {
                    tasks.copyCompsFromTscjs();
                });
            });
        }

        await promise;
        build.prompt.end();
        echo(`Done.`);
    },
};

// task state: ⌛, ✔️, ❌
build.tasks = (() => {
    function produceExternalCommandTask(taskName, message, command) {
        function changeDraft(draft, result) {
            const { logs, code } = result;
            const logsPath = logs.length
                ? ' ' + black.bgYellowBright('output -> ' + logs.join(', '))
                : '';
            if (code === 0) {
                draft('❯ ✔️  ' + message + logsPath);
            } else {
                draft('❯ ❌ ' + message + logsPath);
            }
        }

        return async () => {
            const draft = console.draft('❯ ⌛ ' + message);

            try {
                const result = await execSilently(
                    command,
                    `./logs/${moment().format('YYYYMMDD-HHmmss')}_${taskName}`,
                );
                changeDraft(draft, result);
                build.onTaskFinish();
            } catch (result) {
                changeDraft(draft, result);
                throw new Error();
            }
        };
    }

    return {
        async clean() {
            await fs.remove(paths.get('./build'));
            await fs.mkdir(paths.get('./build'));
            echo('❯ ✔️  Empty the build folder.');
            build.onTaskFinish();
        },
        async cleanRelease() {
            await fs.remove(paths.get('./release'));
            await fs.mkdir(paths.get('./release'));
            echo('❯ ✔️  Empty the release folder.');
            build.onTaskFinish();
        },
        tsCJS: produceExternalCommandTask(
            'tsCJS',
            'tsc: src -> build/tscjs.',
            'tsc -p ./tsconfig.cjs.json',
        ),
        tsESM: produceExternalCommandTask(
            'tsESM',
            'tsc: src -> build/tsesm.',
            'tsc -p ./tsconfig.esm.json',
        ),
        rollupCJS: produceExternalCommandTask(
            'rollupCJS',
            'rollup: build/tsesm -> build/cjs.',
            'rollup -c ./rollup.config.cjs.js',
        ),
        rollupESM: produceExternalCommandTask(
            'rollupESM',
            'rollup: build/tsesm -> build/dev-esm, build/prod-esm.',
            'rollup -c ./rollup.config.esm.js',
        ),
        rollupUMD: produceExternalCommandTask(
            'rollupUMD',
            'rollup: build/tsesm -> build/umd.',
            'rollup -c ./rollup.config.umd.js',
        ),
        compressUmdNoComp: produceExternalCommandTask(
            'compressUmdNoComp',
            'terser: compress build/umd/exnet.prod.umd.js .',
            `terser ./build/umd/exnet.prod.umd.js` +
                ` -c -m -o ./build/umd/exnet.prod.umd.min.js --ecma 2015` +
                ` --source-map "content='./build/umd/exnet.prod.umd.js.map'"`,
        ),
        compressUmdComp: produceExternalCommandTask(
            'compressUmdComp',
            'terser: compress build/umd/exnet.prod.comps.umd.js .',
            `terser ./build/umd/exnet.prod.comps.umd.js` +
                ` -c -m -o ./build/umd/exnet.prod.comps.umd.min.js --ecma 2015` +
                ` --source-map "content='./build/umd/exnet.prod.comps.umd.js.map'"`,
        ),
        async copyCompsFromTsesm() {
            const draft = console.draft(
                '❯ ⌛ Copy components from tsesm/ to dev-esm/ and prod-esm/.',
            );

            try {
                await Promise.all([
                    // dev-esm
                    fs.copy('./build/tsesm/attrs', './build/dev-esm/attrs'),
                    fs.copy(
                        './build/tsesm/connectors',
                        './build/dev-esm/connectors',
                    ),
                    fs.copy('./build/tsesm/nodes', './build/dev-esm/nodes'),
                    // prod-esm
                    fs.copy('./build/tsesm/attrs', './build/prod-esm/attrs'),
                    fs.copy(
                        './build/tsesm/connectors',
                        './build/prod-esm/connectors',
                    ),
                    fs.copy('./build/tsesm/nodes', './build/prod-esm/nodes'),
                ]);
                draft(
                    '❯ ✔️  Copy components from tsesm/ to dev-esm/ and prod-esm/.',
                );
                build.onTaskFinish();
            } catch (e) {
                draft(
                    '❯ ❌ Copy components from tsesm/ to dev-esm/ and prod-esm/.',
                );
                throw new Error();
            }
        },
        async copyCompsFromTscjs() {
            const draft = console.draft(
                '❯ ⌛ Copy components from tscjs/ to cjs/.',
            );

            try {
                await Promise.all([
                    fs.copy('./build/tsesm/attrs', './build/cjs/attrs'),
                    fs.copy(
                        './build/tsesm/connectors',
                        './build/cjs/connectors',
                    ),
                    fs.copy('./build/tsesm/nodes', './build/cjs/nodes'),
                ]);
                draft('❯ ✔️  Copy components from tscjs/ to cjs/.');
                build.onTaskFinish();
            } catch (e) {
                draft('❯ ❌ Copy components from tscjs/ to cjs/.');
                throw new Error();
            }
        },
        async copyAutoCJS() {
            await fs.copy('./src/exnet.auto.cjs.js', './build/cjs/exnet.js');
            echo('❯ ✔️  Copy exnet.auto.cjs.js to cjs/.');
            build.onTaskFinish();
        },
        async copyDtsFromTsesm() {
            const draft = console.draft(
                '❯ ⌛ Copy dts from tsesm/ to cjs/, dev-esm/, prod-esm/.',
            );
            try {
                const dtsPaths = [
                    ['./build/tsesm/exnet.dev.d.ts', './build/cjs/exnet.d.ts'],
                    [
                        './build/tsesm/exnet.dev.d.ts',
                        './build/dev-esm/exnet.d.ts',
                    ],
                    [
                        './build/tsesm/exnet.dev.d.ts',
                        './build/prod-esm/exnet.d.ts',
                    ],
                ];
                (await globby('./build/tsesm/core/**/*.d.ts')).map((path) => {
                    const cjsDest = path.replace(
                        './build/tsesm',
                        './build/cjs',
                    );
                    const devesmDest = path.replace(
                        './build/tsesm',
                        './build/dev-esm',
                    );
                    const prodesmDest = path.replace(
                        './build/tsesm',
                        './build/prod-esm',
                    );
                    dtsPaths.push([path, cjsDest]);
                    dtsPaths.push([path, devesmDest]);
                    dtsPaths.push([path, prodesmDest]);
                });

                await Promise.all(
                    dtsPaths.map(([src, dest]) => fs.copy(src, dest)),
                );
                draft(
                    '❯ ✔️  Copy dts from tsesm/ to cjs/, dev-esm/, prod-esm/.',
                );
                build.onTaskFinish();
            } catch (e) {
                draft(
                    '❯ ❌ Copy dts from tsesm/ to cjs/, dev-esm/, prod-esm/.',
                );
                throw new Error();
            }
        },
        async copyReleaseFiles() {
            const draft = console.draft('❯ ⌛ Copy files.');
            try {
                const promises = [
                    fs.copy('./src', './release/src'),
                    fs.copy('./build/cjs', './release'),
                    fs.copy('./build/dev-esm', './release/dev-esm'),
                    fs.copy('./build/prod-esm', './release/prod-esm'),
                    fs.copy('./build/umd', './release/umd'),
                    fs.copy('./package.json', './release/package.json'),
                    fs.copy('./README.md', './release/README.md'),
                    fs.copy('./LICENSE', './release/LICENSE'),
                    fs.copy('./CHANGELOG.md', './release/CHANGELOG.md'),
                ];

                await Promise.all(promises);
                draft('❯ ✔️  Copy files.');
                build.onTaskFinish();
            } catch (e) {
                draft('❯ ❌ Copy files.');
                throw new Error();
            }
        },
        async generatePathMapping() {
            fs.writeFileSync('./release/dev-esm/path-mapping.js', '\n');
            fs.writeFileSync('./release/prod-esm/path-mapping.js', '\n');
            echo('❯ ✔️  generatePathMapping: TO DO.');
            build.onTaskFinish();
        },
        async correctMapSources() {
            echo('❯ ✔️  correctMapSources: TO DO.');
            build.onTaskFinish();
        },
    };
})();

build.prompt = {
    end: undefined,
    updateStatus: undefined,
    show() {
        const version = getExNetVersion();

        function getStatus() {
            const seconds = Math.floor((Date.now() - build.timeBegin) / 1000);
            return bold(
                `${seconds}s elapsed. ${build.tasksLeft} task(s) left.`,
            );
        }

        const dots = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'.split('');
        let dot = 0;
        function getBuilding() {
            dot = (dot + 1) % dots.length;
            return dots[dot] + ' ' + buildingMsg;
        }

        const buildingMsg = cyan.bold('Building ExNet v' + version + ' ...');
        const building = console.draft(getBuilding());
        const status = console.draft(getStatus());

        const interval_1 = setInterval(() => {
            building(getBuilding());
        }, 100);
        const interval_2 = setInterval(() => {
            status(getStatus());
        }, 1000);

        build.prompt.end = () => {
            clearInterval(interval_1);
            clearInterval(interval_2);
        };
        build.prompt.updateStatus = () => {
            status(getStatus());
        };
    },
};
