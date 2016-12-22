import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EXIT.",
  "exit from step-loop.",
];

statementType(tests, "EXIT", Statements.Exit);