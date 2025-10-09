import {BeginSingleInclude} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: `DATA: BEGIN OF edi_line OCCURS 100.
    INCLUDE STRUCTURE zedi_pos.
DATA: END OF edi_line.`, cnt: 0},
];

testRule(tests, BeginSingleInclude);
