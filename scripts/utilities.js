const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const child_process = require('child_process');

function echo(...args) {
    console.log(...args);
}
exports.echo = echo;

const paths = {
    get(str) {
        return path.resolve(paths.projectRoot, str);
    },
    projectRoot: path.resolve(__dirname, '../'),
    scriptsDir: path.resolve(__dirname),
};
exports.paths = paths;

exports.cliArgs = process.argv.slice(2);

function getExNetVersion() {
    return fs.readJSONSync(paths.get('./package.json')).version;
}
exports.getExNetVersion = getExNetVersion;

function ask(message) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) =>
        rl.question(chalk.blueBright(message), (answer) => {
            resolve(answer);
            rl.close();
        }),
    );
}
exports.ask = ask;

async function askAndCheck(message, check) {
    while (true) {
        let answer = await ask(message);
        if (check(answer)) return answer;
        echo(chalk.red('Illegal format. Check your input.'));
    }
}
exports.askAndCheck = askAndCheck;

async function askYesOrNo(message, defaultAnswer) {
    defaultAnswer =
        typeof defaultAnswer === 'string'
            ? defaultAnswer.toLowerCase() === 'y'
            : defaultAnswer;
    const postfix =
        typeof defaultAnswer === 'undefined'
            ? ' [y/n] '
            : defaultAnswer
            ? ' [Y/n] '
            : ' [y/N] ';
    message += postfix;

    while (true) {
        let answer = await ask(message);
        answer = answer.replace(/\s/g, '').toLowerCase();
        if (answer === 'y') return true;
        if (answer === 'n') return false;
        if (answer === '' && typeof defaultAnswer !== 'undefined') {
            return defaultAnswer;
        }
        echo(chalk.red('Invalid answer. Please enter Y or N.'));
    }
}
exports.askYesOrNo = askYesOrNo;

function exec(command, indent = 0) {
    return new Promise((resolve, reject) => {
        const timeBegin = Date.now();
        const proc = child_process.spawn(command, {
            cwd: paths.projectRoot,
            shell: true,
            stdio: 'inherit',
        });

        proc.on('exit', (code) => {
            const result = {
                code,
                time: Date.now() - timeBegin,
            };
            if (code !== 0) {
                reject(result);
            } else {
                resolve(result);
            }
        });
    });
}
exports.exec = exec;

function execSilently(command) {
    return new Promise((resolve, reject) => {
        const timeBegin = Date.now();
        child_process.exec(
            command,
            {
                cwd: paths.projectRoot,
                shell: true,
            },
            (err, stdout, stderr) => {
                const result = {
                    code: err ? err.code : 0,
                    time: Date.now() - timeBegin,
                    stderr,
                    stdout,
                };
                if (result.code !== 0) {
                    reject(result);
                } else {
                    resolve(result);
                }
            },
        );
    });
}
exports.execSilently = execSilently;

async function isGitClean() {
    return (await execSilently('git status --porcelain')).stdout.trim() === '';
}
exports.isGitClean = isGitClean;

async function currentGitBranch() {
    return (await execSilently('git branch --show-current')).stdout.trim();
}
exports.currentGitBranch = currentGitBranch;
