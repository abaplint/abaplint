import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CLASS foobar IMPLEMENTATION.",
];

statementType(tests, "CLASS", Statements.ClassImplementation);