import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "LOAD REPORT lv_prog PART 'HEAD' INTO lt_head.",
];

statementType(tests, "LOAD REPORT", Statements.LoadReport);