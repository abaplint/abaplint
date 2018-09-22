import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DEMAND foo = bar FROM CONTEXT ctx.",
];

statementType(tests, "DEMAND", Statements.Demand);