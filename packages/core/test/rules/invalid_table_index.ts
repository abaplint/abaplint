import {InvalidTableIndex} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "DATA(first) = table[ 0 ].", cnt: 1},
  {abap: "DATA(first) = table[ 1 ].", cnt: 0},
  {abap: "READ TABLE gt_stack ASSIGNING <ls_stack> INDEX 0.", cnt: 1},
  {abap: "READ TABLE gt_stack ASSIGNING <ls_stack> INDEX 1.", cnt: 0},
];

testRule(tests, InvalidTableIndex);