import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "free object foobar.",
];

statementType(tests, "FREE OBJECT", Statements.FreeObject);