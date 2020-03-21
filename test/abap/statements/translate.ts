import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TRANSLATE rv_package USING '/_'.",
  "translate lv_foo to upper case.",
];

statementType(tests, "TRANSLATE", Statements.Translate);
