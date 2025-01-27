import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `VERIFICATION-MESSAGE point msg.`,
  `VERIFICATION-MESSAGE 'ABORT' 'error' PRIORITY 4.`,
];

statementType(tests, "VERFICATION-MESSAGE", Statements.VerificationMessage);