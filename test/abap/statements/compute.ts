import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "COMPUTE exact <foo> = bar.",
];

statementType(tests, "COMPUTE", Statements.Compute);