import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EXTRACT header.",
];

statementType(tests, "EXTRACT", Statements.Extract);