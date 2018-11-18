import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "INITIALIZATION.",
];

statementType(tests, "INITIALIZATION", Statements.Initialization);