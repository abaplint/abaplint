import {CommentedCode} from "../../src/rules/commented_code";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE: / 'hello'.", cnt: 0},
  {abap: "* WRITE: / 'hello'.", cnt: 1},
  {abap: "* .", cnt: 0},
  {abap: "* ", cnt: 0},
  {abap: "* hello", cnt: 0},
];

testRule(tests, CommentedCode);