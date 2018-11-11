import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "class-data EOL type CHAR01 value CL_ABAP_CHAR_UTILITIES=>CR_LF.",
  "CLASS-DATA gv_out TYPE xstring.",
  "class-data gv_var type zfoo value 'FOO' read-only .",
];

statementType(tests, "CLASS-DATA", Statements.ClassData);