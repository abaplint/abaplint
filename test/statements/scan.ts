import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SCAN ABAP-SOURCE it_code TOKENS INTO lt_tokens STATEMENTS INTO lt_statements WITH ANALYSIS.",
];

statementType(tests, "SCAN", Statements.Scan);