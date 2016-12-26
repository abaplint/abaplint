import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ENHANCEMENT-SECTION section SPOTS spot.",
];

statementType(tests, "ENHANCEMENT-SECTION", Statements.EnhancementSection);