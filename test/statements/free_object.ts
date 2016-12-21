import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "free object foobar.",
];

statementType(tests, "FREE OBJECT", Statements.FreeObject);