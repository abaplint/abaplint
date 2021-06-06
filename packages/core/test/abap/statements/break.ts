import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "break-point.",
  "BREAK-POINT AT NEXT APPLICATION STATEMENT.",
  "break username.",
  "BREAK sy-uname.",
  "BREAK sy-anything.",
  "BREAK-POINT lv_logtxt.",
];

statementType(tests, "BREAK-POINT", Statements.Break);