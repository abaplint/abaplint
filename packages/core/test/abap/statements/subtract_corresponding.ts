import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SUBTRACT-CORRESPONDING foo FROM bar.",
];

statementType(tests, "SUBTRACT-CORRESPONDING", Statements.SubtractCorresponding);