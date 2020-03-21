import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CONVERT TEXT foo-text INTO SORTABLE CODE foo-xtext.",
];

statementType(tests, "CONVERT TEXT", Statements.ConvertText);