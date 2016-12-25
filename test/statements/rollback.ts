import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ROLLBACK WORK.",
];

statementType(tests, "ROLLBACK WORK", Statements.Rollback);