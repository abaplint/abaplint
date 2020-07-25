import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENDENHANCEMENT.",
];

statementType(tests, "ENDENHANCEMENT", Statements.EndEnhancement);