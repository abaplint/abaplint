import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DEMAND foo = bar FROM CONTEXT ctx.",
];

statementType(tests, "DEMAND", Statements.Demand);