import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ENDEXEC.",
];

statementType(tests, "ENDEXEC", Statements.EndExec);