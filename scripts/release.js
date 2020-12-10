const {
    askAndCheck,
    askYesOrNo,
    echo,
    exec,
    paths,
    getExNetVersion,
    isGitClean,
    currentGitBranch,
} = require('./utilities');
const chalk = require('chalk');
const { red, cyan, black } = chalk;
const fs = require('fs-extra');

process.on('unhandledRejection', (reason) => {
    echo();
    echo('Unhandled rejection:');
    echo(reason);
    process.exit(1);
});

main();
async function main() {
    if ((await currentGitBranch()) !== 'main') {
        echo(red('⚠ You\'re not on "main" branch.'));
    }
    if (!(await isGitClean())) {
        echo(red('Commit all the changes before you start releasing.'));
        return;
    }

    echo('Current version: v' + getExNetVersion());

    const version = await askAndCheck('Enter new version: v', (ver) => /^\d+\.\d+\.\d+$/.test(ver));
    const sure = await askYesOrNo(`Releasing v${black.bgWhite(version)} - are you sure?`, 'n');
    if (!sure) {
        echo('Release cancelled.');
        return;
    }

    echo(`Releasing v${version} ...\n`);

    function echoAndExec(command) {
        echo(black.bgYellowBright('$ ' + command));
        return exec(command);
    }
    const bb = black.bgBlueBright;

    echo(bb('[1/9] Linting...'));
    await echoAndExec('yarn lint');

    echo(bb('[2/9] Building...'));
    await echoAndExec('yarn build');

    echo(bb('[3/9] Testing...'));
    await echoAndExec('yarn test');

    echo(bb('[4/9] Bump version in package.json'));
    bumpVersionInPackageJson(version);

    echo(bb('[5/9] Updating CHANGELOG.md ...'));
    await echoAndExec('yarn changelog');

    echo(bb('[6/9] Making package...'));
    await echoAndExec('yarn make-package');

    echo(bb('[7/9] git add, commit, tag'));
    await echoAndExec('git add -A'); // should add package.json, CHANGELOG.md
    await echoAndExec('git add -f release');
    await echoAndExec(`git commit -m "build: release v${version}"`);
    await echoAndExec(`git tag v${version}`);

    echo(bb('[8/9] Syncing with GitHub...'));
    await echoAndExec('git push');
    await echoAndExec('git push --tags');

    echo(bb('[9/9] Publishing to NPM...'));
    const npmRegistry =
        ' --metrics-registry "https://registry.npmjs.org/"' +
        ' --registry "https://registry.npmjs.org/"';
    const hasLoggedIn = await askYesOrNo(cyan('Have you logged in to NPM?'), 'y');
    if (!hasLoggedIn) {
        echo(chalk.bgYellowBright.black('$ npm login'));
        await exec('npm login' + npmRegistry);
    }
    await echoAndExec('npm publish ./release' + npmRegistry);

    echo('done');
}

// Modify the version field without affecting other text.
// Using the JSON tool may change the order of the keys.
function bumpVersionInPackageJson(version) {
    let text = fs.readFileSync(paths.get('./package.json'), 'utf8');

    const reg = /\n {4}"version": "\d+\.\d+\.\d+",\n/g;
    const countMatch = ((text || '').match(reg) || []).length;
    if (countMatch !== 1) {
        throw new Error('package.json must be UTF-8, LF line-ending, 4-spaces-indented.');
    }
    text = text.replace(reg, '\n    "version": "' + version + '",\n');
    fs.writeFileSync(paths.get('./package.json'), text, {
        encoding: 'utf8',
    });
}
