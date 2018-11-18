import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "REJECT.",
  "REJECT 'BKPF'.",
];

statementType(tests, "REJECT", Statements.Reject);