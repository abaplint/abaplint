import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "free foobar.",
];

statementType(tests, "FREE", Statements.Free);