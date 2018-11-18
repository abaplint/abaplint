import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CONTEXTS ctx.",
];

statementType(tests, "CONTEXTS", Statements.Contexts);