import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "COMPUTE exact <foo> = bar.",
];

statementType(tests, "COMPUTE", Statements.Compute);