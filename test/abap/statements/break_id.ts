import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "break-point id foo.",
];

statementType(tests, "BREAK-POINT ID", Statements.BreakId);