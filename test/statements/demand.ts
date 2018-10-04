import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DEMAND foo = bar FROM CONTEXT ctx.",
  "demand foo = bar from context ctx messages into l_msg.",
];

statementType(tests, "DEMAND", Statements.Demand);