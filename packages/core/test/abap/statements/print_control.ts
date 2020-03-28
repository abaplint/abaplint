import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "print-control index-line lv_line.",
  "print-control function 'ASDF'.",
];

statementType(tests, "PRINT-CONTROL", Statements.PrintControl);