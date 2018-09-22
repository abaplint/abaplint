import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "EXTRACT header.",
];

statementType(tests, "EXTRACT", Statements.Extract);