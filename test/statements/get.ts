import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET foobar.",
  "GET foobar LATE.",
];

statementType(tests, "GET", Statements.Get);