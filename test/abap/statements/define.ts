import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "DEFINE foo.",
  "DEFINE foo-bar.",
  "DEFINE bar%foo.",
  "define macro>.",
  "DEFINE ?macro?.",
];

statementType(tests, "DEFINE", Statements.Define);