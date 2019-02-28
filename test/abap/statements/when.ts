import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "WHEN OTHERS.",
  "WHEN 'X'.",
  "WHEN bar.",
  "WHEN bar OR foo.",
  "WHEN TYPE cl_salv_fullscreen_adapter INTO DATA(full_screen_adapter).",
];

statementType(tests, "WHEN", Statements.When);