import {LineLength, LineLengthConf} from "../../src/rules/line_length";
import {testRule} from "./_utils";

const tests = [
  // length: 269
  {abap: "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, LineLength);

// test maximum allowed line length
testRule(tests, LineLength, new LineLengthConf().length = 400);