import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "ENHANCEMENT-SECTION section SPOTS spot.",
];

statementType(tests, "ENHANCEMENT-SECTION", Statements.EnhancementSection);