import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TEST-INJECTION seoredef.",
];

statementType(tests, "TEST-INJECTION", Statements.TestInjection);