import {WhitespaceEnd} from "../../src/rules/whitespace_end";
import {testRule} from "../utils";

let tests = [
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: "WRITE 'hello'.  ", cnt: 1},
];

testRule(tests, "test whitespace_end rule", WhitespaceEnd);