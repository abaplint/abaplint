import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "COLLECT WA_VBBE INTO IT_VBBE.",
  "COLLECT users.",
  "collect foo into bar-moo assigning field-symbol(<foo>).",
];

statementType(tests, "COLLECT", Statements.Collect);