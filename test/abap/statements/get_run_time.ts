import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "GET RUN TIME FIELD lv_t1.",
];

statementType(tests, "GET RUN TIME", Statements.GetRunTime);