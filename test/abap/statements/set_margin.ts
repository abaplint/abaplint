import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET MARGIN 1 5.",
];

statementType(tests, "SET MARGIN", Statements.SetMargin);