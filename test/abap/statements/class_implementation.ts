import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CLASS foobar IMPLEMENTATION.",
];

statementType(tests, "CLASS", Statements.ClassImplementation);