import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SUM.",
];

statementType(tests, "SUM", Statements.Sum);