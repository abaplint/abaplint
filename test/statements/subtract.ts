import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SUBTRACT foo FROM bar.",
];

statementType(tests, "SUBTRACT", Statements.Subtract);