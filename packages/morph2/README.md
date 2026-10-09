# morph2: `@abaplint/core` to ABAP

This folder transpiles the repository's `packages/core/src` TypeScript with [ABAPiti](https://github.com/oisee/abapiti).

## Run

Prerequisites: Node.js 22 or newer, npm, Git, and the Go version required by ABAPiti's current `main` branch.

From this folder, run:

```sh
npm run transpile
```

The script fetches the latest ABAPiti `main` commit, installs that revision's lockfile dependencies, builds its CLI, then transpiles the `.ts` files directly from `packages/core/src` to `.clas.abap` files under `output/`. Each output is grouped under its source module path (including the module basename), and `output/transpile-manifest.json` records the ABAPiti commit, source package version, inputs, and generation summary.

Every run needs GitHub access to fetch the latest `main`; npm access is needed on the first run and whenever ABAPiti's dependency lockfile changes. The checkout and installed dependencies are cached. Remove `.cache/` to bootstrap the toolchain again. The manifest records the Go version used and the minimum version required by the fetched ABAPiti revision.

## Scope and limits

The workflow reads the TypeScript files from the current working tree, so it includes local source changes that have not been published to npm.

ABAPiti describes its TypeScript frontend as experimental. It handles a limited subset of the language; generated files can contain `TODO` placeholders, duplicate class names, identifiers longer than ABAP's 30-character limit, or lines over 255 characters. The manifest counts these cases. Treat this output as a transpilation artifact for inspection and follow-up work, not as a ready-to-import ABAP package.
