import {testRule, testRuleFix} from "./_utils";
import {InStatementIndentation, InStatementIndentationConf} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser\n    error", cnt: 0},
  {abap: "parser\n\n\nerror", cnt: 0},
  {abap: "WRITE: / 'abc'.", cnt: 0},
  {abap: "WRITE: /\n'abc'.", cnt: 1},
  {abap: "WRITE: /\n  'abc'.", cnt: 0},
  {abap: "IF foo = bar1\nAND moo = boo.", cnt: 1},
  {abap: "IF foo = bar2\n  AND moo = boo.", cnt: 1},
  {abap: "IF foo = bar3\n    AND moo = boo.", cnt: 0},
];

testRule(tests, InStatementIndentation);

const fixTests = [
  {
    input: "IF foo = bar\n  AND moo = loo.",
    output: "IF foo = bar\n    AND moo = loo.",
  },
];

testRuleFix(fixTests, InStatementIndentation);

const testsNoBlock = [
  {abap: "IF foo = baz1\nAND moo = boo.", cnt: 1},
  {abap: "IF foo = baz2\n  AND moo = boo.", cnt: 0},
  {abap: "IF foo = baz3\n    AND moo = boo.", cnt: 0}, // larger indent is allowed
];

testRule(testsNoBlock, InStatementIndentation, new InStatementIndentationConf().blockStatements = 0);
