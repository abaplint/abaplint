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

  "SCAN ABAP-SOURCE buffer\n" +
  "  TOKENS      INTO tokens\n" +
  "  STATEMENTS  INTO statements\n" +
  "  OVERFLOW    INTO overflow\n" +
  "  KEYWORDS FROM keywrods\n" +
  "  MESSAGE  INTO message\n" +
  "  WITHOUT TRMAC\n" +
  "  WITH ANALYSIS.",

  "scan abap-source buffer\n" +
  "  tokens     into tokens\n" +
  "  statements into statements\n" +
  "  keywords from keywords\n" +
  "  include program from shift_old_include\n" +
  "  frame program from shift_old_main\n" +
  "  levels   into levels\n" +
  "  with analysis\n" +
  "  with includes\n" +
  "  without trmac.",

  "SCAN ABAP-SOURCE buffer\n" +
  "  TOKENS     INTO tokens\n" +
  "  STATEMENTS INTO statements\n" +
  "  OVERFLOW   INTO overflow\n" +
  "  KEYWORDS   FROM keywords\n" +
  "  PROGRAM    FROM program\n" +
  "  MESSAGE    INTO message\n" +
  "  WITHOUT TRMAC\n" +
  "  WITH ANALYSIS.",

  "SCAN ABAP-SOURCE buffer\n" +
  "  TOKENS      INTO         tokens\n" +
  "  STATEMENTS  INTO         statements\n" +
  "  INCLUDE     PROGRAM FROM include\n" +
  "  FRAME       PROGRAM FROM frame\n" +
  "  WITH COMMENTS\n" +
  "  WITH DECLARATIONS\n" +
  "  WITH BLOCKS\n" +
  "  WITH INCLUDES.",

  "scan abap-source buffer\n" +
  "  statements      into STATEMENTS\n" +
  "  tokens          into TOKENS\n" +
  "  include program from PROGRAM\n" +
  "  message         into MESSAGE\n" +
  "  include         into include\n" +
  "  word            into WORD\n" +
  "  line            into LINE\n" +
  "  with includes.",

  "SCAN ABAP-SOURCE buffer\n" +
  "  FROM start\n" +
  "  TO   end\n" +
  "  TOKENS     INTO tokens\n" +
  "  STATEMENTS INTO statements.",

  "SCAN ABAP-SOURCE lt_code\n" +
  "  TOKENS INTO lt_tokens\n" +
  "  STATEMENTS INTO lt_statements\n" +
  "  WITH ANALYSIS\n" +
  "  WITH PRAGMAS '*'.",

  "SCAN ABAP-SOURCE buffer\n" +
  "  TOKENS          INTO l_tokens\n" +
  "  STATEMENTS      INTO ls_statements\n" +
  "  LEVELS          INTO l_levels\n" +
  "  KEYWORDS        FROM l_keywords\n" +
  "  INCLUDE PROGRAM FROM l_include\n" +
  "  FRAME PROGRAM   FROM l_frame\n" +
  "  WITH ANALYSIS\n" +
  "  WITH INCLUDES\n" +
  "  WITHOUT TRMAC\n" +
  "  ENHANCEMENTS INTO l_enh\n" +
  "  INCLUDE INTO l_incl.",
];

statementType(tests, "SCAN", Statements.Scan);