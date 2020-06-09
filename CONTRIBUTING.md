# Contributing

We love contributions from everyone. By participating in this project, you agree
to abide by the thoughtbot [code of conduct].

[code of conduct]: https://thoughtbot.com/open-source-code-of-conduct

We expect everyone to follow the code of conduct anywhere in thoughtbot's
project codebases, issue trackers, chatrooms, and mailing lists.

## Contributing Code

Fork the repo.

Install dependencies:

```bash
yarn install
```

Make sure the tests pass:

```bash
yarn test
```

Make your change, with new passing tests. Before committing your changes, run the code formatter:

```bash
yarn pretty
```

Follow the [style guide][style].

[style]: https://github.com/thoughtbot/guides/tree/master/style

Push to your fork. Write a [good commit message][commit]. Submit a pull request.

[commit]: http://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html

Others will give constructive feedback. This is a time for discussion and
improvements, and making the necessary changes will be required before we can
merge the contribution.

## Publishing to NPM

First, ensure you have the latest version of the `master` branch checked out, then build the code with:

```
yarn build
```

This compiles the TypeScript code to the `dist` directory. Only the compiled code is published to NPM. The `package.json` sets the `main` file as `dist/index.js`. Visually look at the build folder to ensure it has the expected files.

Next, increment the version using one of the following commands, according to semantic versioning guidelines:

```
# minor fixes and improvements
npm version patch

# new non-breaking features
npm version minor

# breaking changes
npm version major
```

Next, run `npm publish` to publish to NPM. Only thoughtbot employees with access to our NPM account can publish new versions.

Finally, push up the tag that was created by the `npm version` command with `git push origin {tag name}` and then create a release in GitHub with a description of what changed. Be sure to explicitly call out any breaking changes.
