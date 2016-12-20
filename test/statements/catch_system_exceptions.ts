import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "catch system-exceptions import_mismatch_errors = 1.",
];

statementType(tests, "CATCH SYSTEM-EXCEPTIONS", Statements.CatchSystemExceptions);