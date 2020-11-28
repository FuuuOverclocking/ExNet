console.log(`
Usage: yarn <command>

Commands:
    help                    Show this help message.
    start                   Build the project in watch mode,
                                and then you can test at any time.
    test                    Test with Jest.
    build                   Build the whole project.
    build --tscjs-only      Build the project, targetting tscjs only.
    make-package            Make NPM package.
    lint                    Lint with eslint.
    release                 Lint, build, test, generate changlog, ...
                                and finally release the package to NPM.
    cz                      Commit changes.
    changlog                Generate "CHANGLOG.md".

🚩 Make sure you run the scripts in the / of this project, not in './scripts'.
`);
