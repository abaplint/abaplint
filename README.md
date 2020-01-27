[![npm version](https://badge.fury.io/js/abaplint.svg)](https://badge.fury.io/js/abaplint)
[![Build Status](https://github.com/abaplint/abaplint/workflows/Main/badge.svg)](https://github.com/abaplint/abaplint/actions)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fabaplint%2Fabaplint.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fabaplint%2Fabaplint?ref=badge_shield)
[![codecov](https://codecov.io/gh/abaplint/abaplint/branch/master/graph/badge.svg)](https://codecov.io/gh/abaplint/abaplint)

# abaplint

Linter for ABAP, code must be serialized using [abapGit](https://github.com/larshp/abapGit).

Regarding versioning: semantic versioning is currently not followed, recommend fixing usage to a specific version

[Online Playground](https://playground.abaplint.org)

[Syntax Diagrams](https://syntax.abaplint.org)

Get default configuration by running `abaplint -d > abaplint.json`

### Works with
* [VS Code](https://marketplace.visualstudio.com/items?itemName=larshp.vscode-abaplint) ([source](https://github.com/abaplint/vscode-abaplint))
* [GitHub App](https://github.com/apps/abaplint)
* [GitHub Actions](https://github.com/abaplint/actions-abaplint)
* [GitLab Pipelines](https://gitlab.com/sbu-absw/abaplint-example)
* [Bitbucket Pipelines](https://bitbucket.org/larshp/abaplint_pipeline)
* [Azure Pipelines](https://github.com/abaplint/azure-devops-example)
* [Travis CI](https://blogs.sap.com/2018/12/25/automatic-checking-of-your-abap-code-in-githubgitlab-with-ci-and-abaplint/)

SAP Code inspector via [abaplint-cloud-foundry](https://github.com/abaplint/abaplint-cloud-foundry) and [abaplint-abap-backend](https://github.com/abaplint/abaplint-abap-backend).

Also see [abapOpenChecks](https://github.com/larshp/abapOpenChecks).

### Example configs

[abaplint-clean-code](https://github.com/FreHu/abaplint-clean-code) contains rule documentation as well as abaplint.json definitions which attempt to align abaplint with the official [Clean ABAP](https://github.com/SAP/styleguides/blob/master/clean-abap/CleanABAP.md) styleguide.

### Requirements
Node.js 10

### Building
```
npm install
npm test
```

### Parsing vs standard ABAP
* Spaces required after string literals and before right parenthesis
* CALL FUNCTION EXCEPTIONS must be well formed
* Only single chaining
* Macros are only scoped to current file
