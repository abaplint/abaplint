import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CONTEXTS ctx.",
];

statementType(tests, "CONTEXTS", Statements.Contexts);