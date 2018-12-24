import {SequentialBlank} from "../../src/rules/whitespace/sequential_blank";
import {testRule} from "./_utils";

const tests = [
  {abap: "\n\n\n\n", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, SequentialBlank);