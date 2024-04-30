import {UseClassBasedExceptions} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "parser error.", cnt: 0},
  {abap: `INTERFACE sdfds.
  METHODS load_data
    EXCEPTIONS
      dp_invalid_parameter.
ENDINTERFACE.`, cnt: 1},
  {abap: `INTERFACE sdfds.
  METHODS load_data
    RAISING
      cx_something.
ENDINTERFACE.`, cnt: 0},
];

testRule(tests, UseClassBasedExceptions);