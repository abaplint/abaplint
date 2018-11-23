import {Nesting} from "../../src/rules/nesting";
import {testRule} from "./_utils";

const tests = [
  {abap: "IF a = b. IF a = b. IF a = b. IF a = b. IF a = b. IF a = b. IF a = b. IF a = b.", cnt: 1},
  {abap: "WRITE: / 'abc'.", cnt: 0},
];

testRule(tests, "test nesting rule", Nesting);