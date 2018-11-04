import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "START-OF-SELECTION.",
];

statementType(tests, "START-OF-SELECTION", Statements.StartOfSelection);