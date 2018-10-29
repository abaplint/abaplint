import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "PUT ldb.",
];

statementType(tests, "PUT", Statements.Put);