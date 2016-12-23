import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET BLANK LINES ON.",
];

statementType(tests, "SET BLANK", Statements.SetBlank);