import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DETAIL.",
];

statementType(tests, "DETAIL", Statements.Detail);