[![npm version](https://badge.fury.io/js/abaplint.svg)](https://badge.fury.io/js/abaplint)
[![Build Status](https://travis-ci.org/larshp/abaplint.svg?branch=master)](https://travis-ci.org/larshp/abaplint)
[![Dependency Status](https://david-dm.org/larshp/abaplint.svg)](https://david-dm.org/larshp/abaplint)
[![codecov.io](https://codecov.io/github/larshp/abaplint/coverage.svg?branch=master)](https://codecov.io/github/larshp/abaplint?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/larshp/abaplint.svg)](https://greenkeeper.io/)

# abaplint

Linter for ABAP, code must be serialized using [abapGit](https://github.com/larshp/abapGit).

Regarding versioning: semantic versioning is currently not followed, recommend fixing usage to a specific version

[Online Playground](https://playground.abaplint.org)

[Syntax Diagrams](https://syntax.abaplint.org)

[Documentation](https://docs.abaplint.org)

The code is in active development and some rules may not be described in documentation yet. In order to see the default configuration with all the rules run `abaplint -d`. You may also save it as the current config in the root dir of your project `abaplint -d > abaplint.json`

### Works with
* [VS Code](https://marketplace.visualstudio.com/items?itemName=larshp.vscode-abaplint) ([source](https://github.com/abaplint/vscode-abaplint))
* [Atom](https://atom.io/packages/linter-abaplint) ([source](https://github.com/larshp/linter-abaplint))
* [Github App](https://github.com/apps/abaplint)

For checking ABAP code inside the ABAP system use [code inspector](http://wiki.scn.sap.com/wiki/display/ABAP/Code+Inspector) or [ATC](http://wiki.scn.sap.com/wiki/display/ABAP/ABAP+Test+Cockpit), also see project [abapOpenChecks](https://github.com/larshp/abapOpenChecks).

### Requirements
Node.js 10

### Building
```
npm install
npm test
```


### Parsing vs standard ABAP
* Spaces required after string literals and before right parenthesis, following gives parser error
`lo_obj->method( 'FOO').`

* CALL FUNCTION EXCEPTIONS must be well formed, eg not
```abap
  CALL FUNCTION 'RFC_PING'
    EXCEPTIONS
      OTHERS.

  CALL FUNCTION 'RFC_PING'
    EXCEPTIONS = 2.
```

* Only single chaning, following gives parser error:
`WRITE: bar: foo.`
