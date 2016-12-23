import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SKIP.",
  "SKIP TO LINE 12.",
  "SKIP 1.",
];

statementType(tests, "SKIP", Statements.Skip);