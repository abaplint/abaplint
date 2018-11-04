import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "RESUME.",
];

statementType(tests, "RESUME", Statements.Resume);