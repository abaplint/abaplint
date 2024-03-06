import {InvalidTableIndex} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "DATA(first) = table[ 0 ].", cnt: 1},
  {abap: "DATA(first) = table[ 1 ].", cnt: 0},
];

testRule(tests, InvalidTableIndex);