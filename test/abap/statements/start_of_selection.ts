import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "START-OF-SELECTION.",
];

statementType(tests, "START-OF-SELECTION", Statements.StartOfSelection);