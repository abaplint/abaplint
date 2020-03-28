import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ADD-CORRESPONDING foo TO bar.",
];

statementType(tests, "ADD-CORRESPONDING", Statements.AddCorresponding);