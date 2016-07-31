import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "IMPORT foo TO bar FROM MEMORY ID 'MOO'.",
  "IMPORT p1 = ls_option FROM DATABASE indx(xl) TO ws_indx ID ws_indx-srtfd.",
  "IMPORT mv_errty = mv_errty FROM DATA BUFFER p_attributes.",
];

statementType(tests, "IMPORT", Statements.Import);