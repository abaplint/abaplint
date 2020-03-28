import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "IMPORT NAMETAB ls_data lt_data ID lv_name.",
];

statementType(tests, "IMPORT NAMETAB", Statements.ImportNametab);