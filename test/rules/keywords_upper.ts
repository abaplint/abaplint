import {KeywordsUpper} from "../../src/rules/keywords_upper";
import {testRule} from "./_utils";

const tests = [
  {abap: "if a = b.", cnt: 1},
  {abap: "foo = |sdf|.", cnt: 0},
  {abap: "foo = boolc( 1 = 2 ).", cnt: 0},
  {abap: "IF a = b.", cnt: 0},
];

testRule(tests, KeywordsUpper);