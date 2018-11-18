import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "COLLECT WA_VBBE INTO IT_VBBE.",
  "COLLECT users.",
];

statementType(tests, "COLLECT", Statements.Collect);