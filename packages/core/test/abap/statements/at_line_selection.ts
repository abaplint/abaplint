import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "AT LINE-SELECTION.",
];

statementType(tests, "AT LINE-SELECTION", Statements.AtLineSelection);