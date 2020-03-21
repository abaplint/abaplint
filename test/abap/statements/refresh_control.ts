import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "REFRESH CONTROL 'TC' FROM SCREEN lv_dyn.",
];

statementType(tests, "REFRESH CONTROL", Statements.RefreshControl);