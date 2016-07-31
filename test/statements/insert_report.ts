import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT REPORT is_progdir-name FROM it_source STATE 'I' PROGRAM TYPE is_progdir-subc.",
  "INSERT REPORT lv_include FROM lt_source.",
];

statementType(tests, "INSERT REPORT", Statements.InsertReport);