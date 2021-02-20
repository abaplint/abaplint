import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENHANCEMENT-SECTION section SPOTS spot.",
  "ENHANCEMENT-SECTION foo-bar SPOTS sdf.",
  "ENHANCEMENT-SECTION asdf SPOTS asdf INCLUDE BOUND.",
];

statementType(tests, "ENHANCEMENT-SECTION", Statements.EnhancementSection);