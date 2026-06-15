# Development

## Setup

Run `npm run install && npm run link-local && npm test` in the root folder to install, test and link everything.

In the `packages/core/` folder `npm run test:only` will run unit tests without linting and more.

Node 16 is required for development

## Debugging

The [Test Explorer UI](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-test-explorer) extension will give you an overview of tests as well as codelens above each test to run/debug.

To continuously compile TypeScript while editing, run one of the following:

```sh
# from repo root
npm run watch:core

# or from packages/core
npm run watch
```

These watch scripts keep `packages/core/build/` up to date, which is useful when using VS Code Test Explorer and Mocha test discovery based on compiled test files.