import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SUPPLY foo = bar TO CONTEXT ctx.",
];

statementType(tests, "SUPPLY", Statements.Supply);