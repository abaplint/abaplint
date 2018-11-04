import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CONVERT TEXT foo-text INTO SORTABLE CODE foo-xtext.",
];

statementType(tests, "CONVERT TEXT", Statements.ConvertText);