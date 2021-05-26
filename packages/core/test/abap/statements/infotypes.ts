import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "INFOTYPES 1000.",
  "INFOTYPES 0001 NAME p0001.",
  "INFOTYPES 0001 OCCURS 2.",
];

statementType(tests, "INFOTYPES", Statements.Infotypes);