import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CONSTANTS END OF foo.",
  "CONSTANTS END OF foo-bar.",
];

statementType(tests, "CONSTANT END", Statements.ConstantEnd);