import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET CURSOR FIELD 'ASDF'.",
  "SET CURSOR FIELD 'ASDF' LINE 1.",
  "set cursor lv_col lv_row.",
  "SET CURSOR FIELD name OFFSET pos.",
  "SET CURSOR FIELD name LINE line OFFSET pos.",
  "set cursor line lv_line offset lv_offset.",
];

statementType(tests, "SET CURSOR", Statements.SetCursor);