import {LineBreakMultipleParameters} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: `parser error`, cnt: 0},
  {abap: `method( parameter1 = value parameter2 = value ).`, cnt: 1},
  {abap: `method( parameter1 = value\n parameter2 = value ).`, cnt: 0},
  {abap: `foo = NEW lcl_bar( parameter1 = value parameter2 = value ).`, cnt: 1},
];

testRule(tests, LineBreakMultipleParameters);