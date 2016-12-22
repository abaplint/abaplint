import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LOAD-OF-PROGRAM.",
];

statementType(tests, "LOAD-OF-PROGRAM", Statements.LoadOfProgram);