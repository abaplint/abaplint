import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELDS TEXT-000.",
];

statementType(tests, "FIELDS", Statements.Fields);