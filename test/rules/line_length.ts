import {LineLength} from "../../src/rules/line_length";
import {testRule} from "../utils";

let tests = [
  {abap: "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello " +
         "hello hello hello hello hello hello hello hello hello", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, "test line_length rule", LineLength);