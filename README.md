[![npm version](https://badge.fury.io/js/abaplint.svg)](https://badge.fury.io/js/abaplint)
[![Build Status](https://travis-ci.org/larshp/abaplint.svg?branch=master)](https://travis-ci.org/larshp/abaplint)
[![Dependency Status](https://david-dm.org/larshp/abaplint.svg)](https://david-dm.org/larshp/abaplint)
[![codecov.io](https://codecov.io/github/larshp/abaplint/coverage.svg?branch=master)](https://codecov.io/github/larshp/abaplint?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/larshp/abaplint.svg)](https://greenkeeper.io/)

# abaplint

Linter for ABAP, code must be serialized using [abapGit](https://github.com/larshp/abapGit)

[Try it online](https://playground.abaplint.org)

Works with
* [VS Code](https://marketplace.visualstudio.com/items?itemName=larshp.vscode-abaplint) ([source](https://github.com/abaplint/vscode-abaplint))
* [Atom](https://atom.io/packages/linter-abaplint) ([source](https://github.com/larshp/linter-abaplint))
* [Github App](https://github.com/apps/abaplint)
* [ABAP in Eclipse](https://github.com/larshp/abaplint-eclipse)

For checking ABAP code inside the ABAP system use [code inspector](http://wiki.scn.sap.com/wiki/display/ABAP/Code+Inspector) or [ATC](http://wiki.scn.sap.com/wiki/display/ABAP/ABAP+Test+Cockpit), also see project [abapOpenChecks](https://github.com/larshp/abapOpenChecks).

### Requirements
Node 10

### Building
`npm install`

`npm test`

### Parsing vs standard ABAP
* Spaces required after string literals and before right parenthesis
* CALL FUNCTION EXCEPTIONS must be well formed, eg not
```abap
  CALL FUNCTION 'RFC_PING'
    EXCEPTIONS
      OTHERS.

  CALL FUNCTION 'RFC_PING'
    EXCEPTIONS = 2.
```
