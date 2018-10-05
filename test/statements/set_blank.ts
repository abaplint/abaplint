import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET BLANK LINES ON.",
  "SET BLANK LINES OFF.",
];

statementType(tests, "SET BLANK", Statements.SetBlank);