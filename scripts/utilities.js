const path = require('path');
const readline = require('readline');
const chalk = require('chalk');
const child_process = require('child_process');
const { Transform } = require('stream');
const StringDecoder = require('string_decoder').StringDecoder;

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

function addIndentToStringStream(width = 4) {
    const decoder = new StringDecoder('utf8');
    let hasPutFirstIndent = false;

    let indent = '';
    const space = ' ';
    for (let i = 0; i < width; ++i) {
        indent += space;
    }

    const t = new Transform({
        transform(chunk, encoding, callback) {
            if (encoding === 'buffer') {
                chunk = decoder.write(chunk);
            }
            if (!hasPutFirstIndent) {
                hasPutFirstIndent = true;
                chunk = indent + chunk;
            }
            chunk = chunk.replace(/\r\n/g, '\r\n' + indent);
            chunk = chunk.replace(/\r(?!\n)/g, '\r' + indent);
            chunk = chunk.replace(/(?<!\r)\n/g, '\n' + indent);
            this.push(chunk);
            callback();
        },
    });
    t.setDefaultEncoding('utf-8');
    t.setEncoding('utf8');
    return t;
}

function exec(command, indent = 0) {
    return new Promise((resolve, reject) => {
        const timeBegin = Date.now();
        const proc = child_process.spawn(command, {
            cwd: paths.projectRoot,
            shell: true,
        });

        const stdout = indent
            ? proc.stdout.pipe(addIndentToStringStream(indent))
            : proc.stdout;
        const stderr = indent
            ? proc.stderr.pipe(addIndentToStringStream(indent))
            : proc.stderr;

        process.stdin.pipe(proc.stdin);
        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

        proc.on('exit', (code) => {
            process.stdin.unpipe(proc.stdin);
            stdout.unpipe(process.stdout);
            stderr.unpipe(process.stderr);

            process.stdout.write('\r');
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
