import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "RESUME.",
];

statementType(tests, "RESUME", Statements.Resume);