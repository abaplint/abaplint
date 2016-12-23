import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET CURSOR FIELD 'ASDF'.",
  "SET CURSOR FIELD 'ASDF' LINE 1.",
  "set cursor lv_col lv_row.",
];

statementType(tests, "SET CURSOR", Statements.SetCursor);