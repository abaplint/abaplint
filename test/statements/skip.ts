import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SKIP.",
];

statementType(tests, "SKIP", Statements.Skip);