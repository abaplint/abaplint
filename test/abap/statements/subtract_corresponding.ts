import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SUBTRACT-CORRESPONDING foo FROM bar.",
];

statementType(tests, "SUBTRACT-CORRESPONDING", Statements.SubtractCorresponding);