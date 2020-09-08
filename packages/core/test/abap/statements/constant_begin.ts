import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CONSTANTS BEGIN OF foo.",
  "CONSTANTS BEGIN OF foo-bar.",
  "CONSTANTS BEGIN OF bar %_PREDEFINED.",
];

statementType(tests, "CONSTANT BEGIN", Statements.ConstantBegin);