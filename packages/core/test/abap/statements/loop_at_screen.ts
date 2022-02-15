import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "LOOP AT SCREEN.",
];

statementType(tests, "LOOP AT SCREEN", Statements.LoopAtScreen);