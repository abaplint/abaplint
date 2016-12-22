import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SUPPRESS DIALOG.",
];

statementType(tests, "SUPPRESS DIALOG", Statements.SuppressDialog);