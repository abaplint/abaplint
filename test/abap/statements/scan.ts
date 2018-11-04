import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

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

  "scan abap-source buffer\n" +
  "  frame program   from lv_frame\n" +
  "  include program from lv_program\n" +
  "  tokens          into lv_tokens\n" +
  "  statements      into lv_statements\n" +
  "  with includes\n" +
  "  with explicit enhancements\n" +
  "  with implicit enhancements\n" +
  "  with inactive enhancements\n" +
  "  enhancement options into lv_eoptions\n" +
  "  enhancements        into lv_enh\n" +
  "  levels              into lv_levels\n" +
  "  replacing                lv_replacing\n" +
  "  id 'RENH' table lv_tab.",

  "scan abap-source buffer\n" +
  "  tokens     into l_tokens\n" +
  "  statements into l_statements\n" +
  "  with analysis\n" +
  "  without trmac\n" +
  "  with list tokenization\n" +
  "  with pragmas '*'.",

  "SCAN ABAP-SOURCE lt_source[] \n" +
  "  TOKENS     INTO lt_tokens[]\n" +
  "  STATEMENTS INTO lt_statements[]\n" +
  "  KEYWORDS   FROM lt_keywords\n" +
  "  MESSAGE    INTO lv_message\n" +
  "  WORD       INTO lv_word\n" +
  "  LINE       INTO lv_line\n" +
  "  OFFSET     INTO lv_offset\n" +
  "  WITHOUT    TRMAC\n" +
  "  WITH INCLUDES.",

  "scan abap-source prog->lines\n" +
  "  frame program from prog->name\n" +
  "  include program from prog->name\n" +
  "  preserving identifier escaping\n" +
  "  with comments\n" +
  "  with includes\n" +
  "  with type-pools\n" +
  "  with pragmas lv_pragma\n" +
  "  tokens       into lv_tokens\n" +
  "  statements   into lv_statements\n" +
  "  levels       into lv_levels\n" +
  "  structures   into lv_structures\n" +
  "  enhancements into lv_enhancements\n" +
  "  line         into lv_line\n" +
  "  word         into lv_word\n" +
  "  offset       into lv_offset\n" +
  "  message      into lv_message\n" +
  "  include      into lv_include\n" +
  "  id lv_id table lv_table.",

];

statementType(tests, "SCAN", Statements.Scan);