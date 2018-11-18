import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "DETAIL.",
];

statementType(tests, "DETAIL", Statements.Detail);