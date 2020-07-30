import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENHANCEMENT-SECTION section SPOTS spot.",
  "ENHANCEMENT-SECTION foo-bar SPOTS sdf.",
];

statementType(tests, "ENHANCEMENT-SECTION", Statements.EnhancementSection);