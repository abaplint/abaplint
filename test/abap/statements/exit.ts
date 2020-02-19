import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "EXIT.",
  "exit from step-loop.",
  "EXIT FROM SQL.",
];

statementType(tests, "EXIT", Statements.Exit);