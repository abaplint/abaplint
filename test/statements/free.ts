import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "free foobar.",
];

statementType(tests, "FREE", Statements.Free);