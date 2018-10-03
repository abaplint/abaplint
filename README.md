[![npm version](https://badge.fury.io/js/abaplint.svg)](https://badge.fury.io/js/abaplint)
[![Build Status](https://travis-ci.org/larshp/abaplint.svg?branch=master)](https://travis-ci.org/larshp/abaplint)
[![Dependency Status](https://david-dm.org/larshp/abaplint.svg)](https://david-dm.org/larshp/abaplint)
[![codecov.io](https://codecov.io/github/larshp/abaplint/coverage.svg?branch=master)](https://codecov.io/github/larshp/abaplint?branch=master)
[![Greenkeeper badge](https://badges.greenkeeper.io/larshp/abaplint.svg)](https://greenkeeper.io/)

# abaplint

Linter for ABAP, code must be serialized using [abapGit](https://github.com/larshp/abapGit)

[Try it online](https://larshp.github.io/abaplint/)

Works with
* [travis](https://travis-ci.org/) ([example](https://github.com/larshp/abaplint-test))
* [Atom](https://github.com/larshp/linter-abaplint)
* [ABAP in Eclipse](https://github.com/larshp/abaplint-eclipse)
* [WABAP](https://github.com/larshp/WABAP)
* VS Code, [#13](https://github.com/larshp/abaplint/issues/13)
* [abaplint.org](http://abaplint.org/)

For checking ABAP code inside the ABAP system use [code inspector](http://wiki.scn.sap.com/wiki/display/ABAP/Code+Inspector) or [ATC](http://wiki.scn.sap.com/wiki/display/ABAP/ABAP+Test+Cockpit), also see project [abapOpenChecks](https://github.com/larshp/abapOpenChecks).

### Requirements
Node 10

### Building
`npm install`

`npm test`

### Parsing vs standard ABAP
* Spaces required after string literals and before right parenthesis
