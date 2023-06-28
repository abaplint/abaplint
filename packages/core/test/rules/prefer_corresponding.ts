import {testRule} from "./_utils";
import {PreferCorresponding} from "../../src/rules";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `MOVE-CORRESPONDING foo TO bar.`, cnt: 1},
  {abap: `MOVE-CORRESPONDING EXACT foo TO bar.`, cnt: 0},
  {abap: `bar = CORRESPONDING #( foo ).`, cnt: 0},
];

testRule(tests, PreferCorresponding);