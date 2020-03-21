import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENHANCEMENT-POINT point SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot STATIC.",
  "ENHANCEMENT-POINT foo-bar SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot INCLUDE BOUND.",
];

statementType(tests, "ENHANCEMENT-POINT", Statements.EnhancementPoint);