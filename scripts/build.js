const fs = require('fs-extra');
const chalk = require('chalk');
const {} = chalk;
const { cliArgs, paths, echo, getExNetVersion } = require('./utilities');
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
        await build.main();
        return;
    }
    if (cliArgs.length === 1 && cliArgs[0] === '--make-package') {
        await makePackage();
        return;
    }
    throw new Error('Invalid CLI arguments.');
}

const build = {
    timeBegin: undefined,
    tasksLeft: 10,
    onTaskFinish: undefined,
    async main() {
        build.timeBegin = Date.now();
        build.prompt.show();

        const tasks = build.tasks;
        const promise = new Promise((resolve) => {
            build.onTaskFinish = () => {
                build.tasksLeft--;
                build.prompt.updateStatus();
                if (build.tasksLeft === 0) resolve();
            };
        });

        await tasks.clean();

        tasks.tsESM().then(() => {
            tasks.rollupUMD().then(() => {
                tasks.compressUMD();
            });
            tasks.rollupCJS();
            tasks.rollupESM();
            tasks.copyCompsFromTsesm();
        });
        tasks.copyAutoCJS();
        tasks.tsCJS().then(() => {
            tasks.copyCompsFromTscjs();
        });

        await promise;

        build.prompt.end();
        echo(`Done.`);
    },
    tasks: undefined,
    prompt: undefined,
};

// task state: ⌛, ✔️, ❌
build.tasks = {
    async clean() {
        await fs.remove(paths.get('./build'));
        await fs.mkdir(paths.get('./build'));
        echo('❯ ✔️  Empty the build folder.');
        build.onTaskFinish();
    },
};

build.prompt = {
    end: undefined,
    updateStatus: undefined,
    show() {
        const version = getExNetVersion();

        function getStatus() {
            const seconds = Math.floor((Date.now() - build.timeBegin) / 1000);
            return chalk.bold(
                `${seconds}s elapsed. ${build.tasksLeft} task(s) left.`,
            );
        }

        const dots = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'.split('');
        let dot = 0;
        function getBuilding() {
            dot = (dot + 1) % dots.length;
            return dots[dot] + ' ' + buildingMsg;
        }

        const buildingMsg = chalk.bold.cyan(
            'Building ExNet v' + version + ' ...',
        );
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
