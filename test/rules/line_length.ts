import {LineLength} from "../../src/rules/line_length";
import {testRule} from "./_utils";

const tests = [
  {abap: "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, LineLength);