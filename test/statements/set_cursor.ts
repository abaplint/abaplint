import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET CURSOR FIELD 'ASDF'.",
];

statementType(tests, "SET CURSOR", Statements.SetCursor);