import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET TITLEBAR 'TITLE'.",
  "SET TITLEBAR 'TITLE_2000' WITH text-t08.",
  "set titlebar 'T00' with field1 field2.",
  "SET TITLEBAR 'TITLE_3000' OF PROGRAM sy-cprog WITH text-001.",
];

statementType(tests, "SET TITLEBAR", Statements.SetTitlebar);