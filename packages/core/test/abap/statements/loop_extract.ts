import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "LOOP.",
];

statementType(tests, "LOOP", Statements.LoopExtract);
