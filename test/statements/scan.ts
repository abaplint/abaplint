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
  "  WITH PRAGMAS abap_true.",

  "scan abap-source lt_source\n" +
  "  tokens     into tokens\n" +
  "  statements into statements\n" +
  "  keywords   from keywords\n" +
  "  with analysis\n" +
  "  with includes\n" +
  "  without trmac.",

  "SCAN ABAP-SOURCE src TOKENS INTO tokens STATEMENTS INTO statements.",

  "scan abap-source src with analysis tokens into tokens statements into stmts.",
];

statementType(tests, "SCAN", Statements.Scan);