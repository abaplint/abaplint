import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PROGRAM yy_program.",
];

statementType(tests, "PROGRAM", Statements.Program);