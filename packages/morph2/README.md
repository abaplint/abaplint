# morph2: abaplint to ABAP

This folder generates ABAP for abaplint using [ABAPiti v0.1.1](https://github.com/oisee/abapiti/releases/tag/v0.1.1).

## Run

Prerequisite: Node.js 22 or newer and npm.

From this folder, run:

```sh
npm run transpile
```

`npm run transpile` downloads the platform binary from the v0.1.1 release, verifies its SHA-256 digest, and runs `abapiti abaplint -o ...`. The release bundles an abaplint snapshot (`577f875e`, `@abaplint/core` 2.120.56). Its generated classes and packages go under `output-abaplint-v0.1.1/`; the binary is cached under `.cache/abapiti-release/`.

The release bundle is self-contained; the generated output does not use the local `packages/core/src` tree. The cached binary is reused on later runs.

## Scope and limits

The release scope covers the abaplint code paths exercised by checking zabapgit with abapGit's CI configuration (v702 and six rules). Other paths may be refused with the TypeScript location of unsupported code. Treat this output as an experiment within that scope.
