# morph2: `@abaplint/core` to ABAP

This folder reproducibly transpiles the published npm package `@abaplint/core` with [ABAPiti](https://github.com/oisee/abapiti).

## Run

Prerequisites: Node.js 22 or newer, npm, Git, Go 1.26.0, and `tar` on `PATH`.

From this folder, run:

```sh
npm run transpile
```

The script downloads the pinned npm tarball, verifies its SHA-512 integrity, checks out the pinned ABAPiti commit, installs ABAPiti's lockfile dependencies, builds its CLI, then writes generated `.clas.abap` files under `output/`. Each output is grouped under its source module path (including the module basename), and `output/transpile-manifest.json` records the inputs and generation summary.

The first run needs network access to npm and GitHub. Subsequent runs reuse the verified tarball and cached tool checkout. Remove `.cache/` to bootstrap the toolchain again from the pinned revisions.

## Scope and limits

The package on npm contains compiled JavaScript and declaration files, not the original TypeScript source. This workflow feeds the published JavaScript modules to ABAPiti's TypeScript AST frontend, so the result reflects the published artifact rather than this repository's working tree.

ABAPiti describes its TypeScript frontend as experimental. It handles a limited subset of the language; generated files can contain `TODO` placeholders, duplicate class names, identifiers longer than ABAP's 30-character limit, or lines over 255 characters. The manifest counts these cases. Treat this output as a transpilation artifact for inspection and follow-up work, not as a ready-to-import ABAP package.
