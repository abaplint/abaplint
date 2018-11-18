import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "free foobar.",
];

statementType(tests, "FREE", Statements.Free);