import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELD sdfds MODULE sdfs ON INPUT.",
  "FIELD sdfds MODULE sdfs.",
  "field go->gv module sdfsd on request.",
  "field foo-bar.", // used in CHAINs
];

statementType(tests, "FIELD", Statements.Field);