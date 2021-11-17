import {NoChainedAssignment} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `var1 = var2 = var3.`, cnt: 1},
  {abap: `var2 = var3.
var1 = var3.`, cnt: 0},
];

testRule(tests, NoChainedAssignment);