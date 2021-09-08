import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "MODIFY SCREEN.",
  "MODIFY SCREEN FROM wa.",
];

statementType(tests, "MODIFY SCREEN", Statements.ModifyScreen);