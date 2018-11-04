import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "FIELDS TEXT-000.",
];

statementType(tests, "FIELDS", Statements.Fields);