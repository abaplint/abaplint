import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ENHANCEMENT-POINT point SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot STATIC.",
  "ENHANCEMENT-POINT foo-bar SPOTS spot.",
  "ENHANCEMENT-POINT point SPOTS spot INCLUDE BOUND.",
];

statementType(tests, "ENHANCEMENT-POINT", Statements.EnhancementPoint);