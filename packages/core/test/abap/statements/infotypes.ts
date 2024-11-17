import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "INFOTYPES 1000.",
  "INFOTYPES 0001 NAME p0001.",
  "INFOTYPES 0001 OCCURS 2.",
  "INFOTYPES 2001 mode n.",
  `infotypes 0000 valid from sy-datum to sy-datum.`,
  `infotypes 0003 name old-p0003 occurs 1 mode n.`,
];

statementType(tests, "INFOTYPES", Statements.Infotypes);