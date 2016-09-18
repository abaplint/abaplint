import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CLEANUP INTO l_cx.",
];

statementType(tests, "CLEANUP", Statements.Cleanup);