import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TYPES foo VALUE IS INITIAL.",
  "TYPES bar VALUE '1'.",
];

statementType(tests, "TYPE ENUM", Statements.TypeEnum);