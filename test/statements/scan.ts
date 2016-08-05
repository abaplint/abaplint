import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SCAN ABAP-SOURCE it_code TOKENS INTO lt_tokens STATEMENTS INTO lt_statements WITH ANALYSIS.",

  "SCAN ABAP-SOURCE mt_code\n" +
  "  TOKENS          INTO mt_tokens\n" +
  "  STATEMENTS      INTO mt_statements\n" +
  "  LEVELS          INTO mt_levels\n" +
  "  STRUCTURES      INTO mt_structures\n" +
  "  WITH ANALYSIS\n" +
  "  WITH COMMENTS.",

  "SCAN ABAP-SOURCE mt_code\n" +
  "  TOKENS          INTO mt_tokens\n" +
  "  STATEMENTS      INTO mt_statements\n" +
  "  LEVELS          INTO mt_levels\n" +
  "  STRUCTURES      INTO mt_structures\n" +
  "  WITH ANALYSIS\n" +
  "  WITH COMMENTS\n" +
  "  WITH PRAGMAS    abap_true.",

  "SCAN ABAP-SOURCE source TOKENS INTO tokens STATEMENTS INTO statements.",
];

statementType(tests, "SCAN", Statements.Scan);