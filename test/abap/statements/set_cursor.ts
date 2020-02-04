import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SET CURSOR FIELD 'ASDF'.",
  "SET CURSOR FIELD 'ASDF' LINE 1.",
  "set cursor lv_col lv_row.",
  "SET CURSOR FIELD name OFFSET pos.",
  "SET CURSOR FIELD name LINE line OFFSET pos.",
];

statementType(tests, "SET CURSOR", Statements.SetCursor);