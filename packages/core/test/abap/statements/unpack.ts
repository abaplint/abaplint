import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "UNPACK lv_dt TO lv_date.",
];

statementType(tests, "UNPACK", Statements.Unpack);