# Getting Started

Install [Node](https://nodejs.org), version 12 or above required

[vscode](https://code.visualstudio.com/) with extension [abaplint](https://marketplace.visualstudio.com/items?itemName=larshp.vscode-abaplint) is also recommended

Run `npm install @abaplint/cli -g` to install the abaplint command line client locally

Run `abaplint` in a folder to check the contents

A `abaplint.json` file can be added/adjusted to enable and disable [rules](https://rules.abaplint.org/), note that vscode knows the json schema for the configuration, so it provides intellisense when editing.

## Starting Configuration

Suggest starting by running only the syntax check relevant rules, having this working will help expanding to more rules,

```json
{
  "global": {
    "files": "/src/**/*.*",
    "exclude": [],
    "skipGeneratedGatewayClasses": true,
    "skipGeneratedPersistentClasses": true,
    "skipGeneratedFunctionGroups": true
  },
  "dependencies": [
    {
      "url": "https://github.com/abaplint/deps",
      "folder": "/deps",
      "files": "/src/**/*.*"
    }
  ],
  "syntax": {
    "version": "v755",
    "errorNamespace": "^(Z|Y|LCL_|TY_|LIF_)",
    "globalConstants": [],
    "globalMacros": []
  },
  "rules": {
    "begin_end_names": true,
    "check_ddic": true,
    "check_include": true,
    "check_syntax": true,
    "global_class": true,
    "implement_methods": true,
    "method_implemented_twice": true,
    "parser_error": true,
    "parser_missing_space": true,
    "superclass_final": true,
    "unknown_types": true,
    "xml_consistency": true
  }
}
```