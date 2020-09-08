import {testRule} from "./_utils";
import {InStatementIndentation} from "../../src/rules";

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