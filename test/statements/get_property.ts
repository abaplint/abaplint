import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH.",
  "GET PROPERTY OF ctrl-obj prop = val NO FLUSH EXPORTING foo = bar.",
];

statementType(tests, "GET PROPERTY", Statements.GetProperty);