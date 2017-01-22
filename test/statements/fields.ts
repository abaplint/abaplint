import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FIELDS TEXT-000.",
];

statementType(tests, "FIELDS", Statements.Fields);