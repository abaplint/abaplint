import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "STOP.",
];

statementType(tests, "STOP", Statements.Stop);