import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "IMPORT foo TO bar FROM MEMORY ID 'MOO'.",
  "IMPORT p1 = ls_option FROM DATABASE indx(xl) TO ws_indx ID ws_indx-srtfd.",
  "IMPORT (lt_export) FROM DATA BUFFER cv_attributes.",
  "import l_foo from database ltdx(XL) id 'foobar'.",
  "IMPORT mv_errty = mv_errty FROM DATA BUFFER p_attributes.",
];

statementType(tests, "IMPORT", Statements.Import);