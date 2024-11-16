import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "print-control index-line lv_line.",
  "print-control function 'ASDF'.",
  `PRINT-CONTROL LINE 1 POSITION 1 SIZE siz.`,
  `PRINT-CONTROL CPI 1 LPI 1 FONT 1.`,
];

statementType(tests, "PRINT-CONTROL", Statements.PrintControl);