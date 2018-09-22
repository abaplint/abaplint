import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET CURSOR FIELD 'ASDF'.",
  "SET CURSOR FIELD 'ASDF' LINE 1.",
  "set cursor lv_col lv_row.",
  "SET CURSOR FIELD name OFFSET pos.",
];

statementType(tests, "SET CURSOR", Statements.SetCursor);