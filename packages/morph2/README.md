# morph2: abaplint to ABAP

This folder generates ABAP for abaplint using the latest stable [ABAPiti release](https://github.com/oisee/abapiti/releases/latest) with readable names.

## Run

Prerequisite: Node.js 22 or newer and npm.

From this folder, run:

```sh
npm run transpile
```

`npm run transpile` checks GitHub for the latest stable release, downloads the matching platform binary, and runs `abapiti abaplint -o ...` with `ABAPITI_NAMES=readable`. It verifies the asset SHA-256 digest when GitHub provides one, and caches the binary under `.cache/abapiti-release/<tag>/`. Generated classes and packages go under `output/`; the manifest records the release tag, binary digest, and naming mode.

The release bundle is self-contained; the generated output does not use the local `packages/core/src` tree. Each run checks the latest release tag before reusing its cached binary, so a newly published release is picked up automatically.

## Scope and limits

The release scope covers the abaplint code paths exercised by checking zabapgit with abapGit's CI configuration (v702 and six rules). Other paths may be refused with the TypeScript location of unsupported code. Treat this output as an experiment within that scope.
