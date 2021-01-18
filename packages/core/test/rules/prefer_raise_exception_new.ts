import {testRule} from "./_utils";
import {PreferRaiseExceptionNew} from "../../src/rules";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "CREATE OBJECT foobar.", cnt: 0},

  {abap: `RAISE EXCEPTION TYPE cx_generation_error
  EXPORTING
    previous = exception.`, cnt: 1},

  {abap: `RAISE EXCEPTION TYPE cx_generation_error
  EXPORTING
    previous = exception
  MESSAGE e136(messages).`, cnt: 1},
];

testRule(tests, PreferRaiseExceptionNew);
