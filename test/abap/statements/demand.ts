import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DEMAND foo = bar FROM CONTEXT ctx.",
  "demand foo = bar from context ctx messages into l_msg.",
];

statementType(tests, "DEMAND", Statements.Demand);