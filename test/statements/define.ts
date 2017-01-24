import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DEFINE foo.",
  "DEFINE foo-bar.",
  "define macro>.",
];

statementType(tests, "DEFINE", Statements.Define);