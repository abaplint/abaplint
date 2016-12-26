import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT REPORT is_progdir-name FROM it_source STATE 'I' PROGRAM TYPE is_progdir-subc.",
  "INSERT REPORT lv_include FROM lt_source.",
  "insert report lv_include from lt_content extension type p_extension.",
  "INSERT REPORT lv_name FROM tab EXTENSION TYPE ext DIRECTORY ENTRY entry.",
];

statementType(tests, "INSERT REPORT", Statements.InsertReport);