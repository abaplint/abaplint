module.exports = {
  "root": true,
  "env": {
      "browser": true,
      "mocha": true,
      "node": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "project": "tsconfig.eslint.json",
      "tsconfigRootDir": __dirname,
      "sourceType": "module"
  },
  "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/errors",
      "plugin:import/warnings",
      "plugin:import/typescript"
  ],
  "overrides": [],
  "rules": {
      "import/no-unresolved": "off",
      "import/namespace": "off",
      "import/named": "off",
      "space-infix-ops": "error",
      "prefer-arrow-callback": "error",
      "import/export": "off",
      "import/newline-after-import": [
          "error",
          {
              "count": 1
          }
      ],
      "object-curly-spacing": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/array-type": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "no-useless-escape": "off",
      "no-undef": "off",
      "@typescript-eslint/ban-ts-ignore": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-control-regex": "off",
      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-member-accessibility": "error",
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/indent": [
          "error",
          2,
          {
              "SwitchCase": 1,
              "ignoreComments": true,
              "CallExpression": {
                  "arguments": "first"
              },
              "FunctionDeclaration": {
                  "parameters": "first"
              },
              "FunctionExpression": {
                  "parameters": "first"
              }
          }
      ],
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/member-delimiter-style": "off",
      "@typescript-eslint/member-ordering": "off",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/quotes": [
          "error",
          "double",
          {
              "avoidEscape": true,
              "allowTemplateLiterals": true
          }
      ],
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/semi": [
          "error",
          "always"
      ],
      "@typescript-eslint/triple-slash-reference": "error",
      "@typescript-eslint/type-annotation-spacing": "off",
      "@typescript-eslint/unified-signatures": "error",
      "camelcase": "off",
      "capitalized-comments": [
          "off",
          "never"
      ],
      "comma-dangle": [
          "error",
          "always-multiline"
      ],
      "constructor-super": "error",
      "curly": "error",
      "default-case": "error",
      "dot-notation": "off",
      "eol-last": "off",
      "eqeqeq": [
          "error",
          "smart"
      ],
      "guard-for-in": "off",
      "id-blacklist": "off",
      "id-match": "error",
      "max-len": [
          "error",
          {
              "ignoreRegExpLiterals": true,
              "ignoreStrings": true,
              "ignorePattern": "^\\s*\\*",
              "code": 140
          }
      ],
      "new-parens": "error",
      "no-bitwise": "error",
      "no-caller": "error",
      "no-cond-assign": "error",
      "no-console": "off",
      "no-constant-condition": "off",
      "no-debugger": "error",
      "no-duplicate-case": "error",
      "no-empty": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-invalid-this": "off",
      "no-irregular-whitespace": "error",
      "no-multiple-empty-lines": "off",
      "no-new-wrappers": "error",
      "no-redeclare": "error",
      "no-return-await": "error",
      "no-sequences": "error",
      "no-shadow": [
          "off",
          {
              "hoist": "all"
          }
      ],
      "no-sparse-arrays": "error",
      "no-trailing-spaces": "error",
      "no-underscore-dangle": "off",
      "no-unused-expressions": "off",
      "no-unused-labels": "error",
      "no-var": "error",
      "no-void": "error",
      "one-var": [
          "error",
          "never"
      ],
      "prefer-const": "error",
      "@typescript-eslint/prefer-readonly": "error",
      "radix": "error",
      "spaced-comment": "off",
      "use-isnan": "error"
  }
};
