const {
    askAndCheck,
    askYesOrNo,
    echo,
    exec,
    paths,
    isGitClean,
    currentGitBranch,
} = require('./utilities');
const chalk = require('chalk');
const { red, blue, cyan } = chalk;
const fs = require('fs-extra');

process.on('unhandledRejection', (reason) => {
    console.log();
    console.log('Unhandled rejection:');
    console.log(reason);
});

main();
async function main() {
    if ((await currentGitBranch()) !== 'main') {
        echo(red('Switch to "main" branch before you start releasing.'));
        // return;
    }
    if (!(await isGitClean())) {
        echo(red('Commit all the changes before you start releasing.'));
        // return;
    }

    const packageJson = fs.readJSONSync(paths.get('./package.json'));
    echo('Current version: v' + packageJson.version);

    const version = await askAndCheck('Enter new version: v', (ver) =>
        /^\d+\.\d+\.\d+$/.test(ver),
    );
    const sure = await askYesOrNo(
        `Releasing v${chalk.bgWhite.black(version)} - are you sure?`,
        'n',
    );
    if (!sure) {
        echo('Release cancelled.');
        return;
    }

    echo(`Releasing v${version} ...`);

    function echoAndExec(command) {
        echo('      ' + chalk.bgYellowBright.black('$ ' + command));
        return exec(command, 6);
    }

    echo(blue('[1/9] Linting...'));
    await echoAndExec('yarn lint');

    echo(blue('[2/9] Building...'));
    await echoAndExec('node ./scripts/build.js');

    echo(blue('[3/9] Testing...'));
    await echoAndExec('yarn jest');

    echo(blue('[4/9] Bump version in package.json'));
    bumpVersionInPackageJson(version);

    echo(blue('[5/9] Making package...'));
    await echoAndExec('node ./scripts/build.js --make-package');

    echo(blue('[6/9] Making CHANGELOG.md ...'));
    await echoAndExec('yarn changelog');

    echo(blue('[7/9] git add, commit, tag'));
    await echoAndExec('git add -A'); // should add package.json, CHANGELOG.md
    await echoAndExec('git add -f release');
    await echoAndExec(`git commit -m "build: release v${version}"`);
    await echoAndExec(`git tag v${version}`);

    echo(blue('[8/9] Syncing with GitHub...'));
    await echoAndExec('git push');
    await echoAndExec('git push --tags');

    echo(blue('[9/9] Publishing to NPM...'));
    const npmRegistry =
        ' --metrics-registry "https://registry.npmjs.org/"' +
        ' --registry "https://registry.npmjs.org/"';
    const hasLoggedIn = await askYesOrNo(
        cyan('      Have you logged in to NPM?'),
        'y',
    );
    if (!hasLoggedIn) {
        echo(chalk.bgYellowBright.black('$ npm login'));
        await exec('npm login' + npmRegistry);
    }
    await echoAndExec('npm publish' + npmRegistry);

    echo('done');
}

// Modify the version field without affecting other text.
// Using the JSON tool may change the order of the keys.
function bumpVersionInPackageJson(version) {
    let text = fs.readFileSync(paths.get('./package.json'), 'utf8');

    const reg = /\n {4}"version": "\d+\.\d+\.\d+",\n/g;
    const countMatch = ((text || '').match(reg) || []).length;
    if (countMatch !== 1) {
        throw new Error(
            'package.json must be UTF-8, LF line-ending, 4-spaces-indented.',
        );
    }
    text = text.replace(reg, '\n    "version": "' + version + '",\n');
    fs.writeFileSync(paths.get('./package.json'), text, {
        encoding: 'utf8',
    });
}
