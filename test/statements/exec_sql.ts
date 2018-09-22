import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "EXEC SQL.",
  "EXEC SQL PERFORMING name.",
];

statementType(tests, "EXEC SQL", Statements.ExecSql);