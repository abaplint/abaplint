import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "PUT ldb.",
];

statementType(tests, "PUT", Statements.Put);