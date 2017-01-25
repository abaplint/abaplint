import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FIND REGEX 'blah' IN lv_statement SUBMATCHES lv_name.",
  "FIND FIRST OCCURRENCE OF REGEX lo_regex IN <ls_diff>-local.",
  "FIND FIRST OCCURRENCE OF '.' IN lv_code_line MATCH OFFSET lv_offs.",
  "FIND REGEX '\\ME:.*\\' IN iv_name MATCH OFFSET lv_off MATCH LENGTH lv_len.",
  "FIND 'blah' IN TABLE t_source IGNORING CASE.",
  "FIND ALL OCCURRENCES OF REGEX 'sdf' IN io_tab->sett-name IGNORING CASE MATCH COUNT lv_match.",
  "FIND ALL OCCURRENCES OF '/' IN <ls_folder>-path MATCH COUNT <ls_folder>-count.",
  "FIND REGEX '(.*/)(.*)' IN iv_str SUBMATCHES lv_path rv_filename.",
  "find first occurrence of regex 'foo' in me->line match count l_cnt results result_tab.",
  "FIND FIRST OCCURRENCE OF SUBSTRING <ls_likp>-kunnr IN <ls_data>-ship.",
  "FIND ALL OCCURRENCES OF '<style' IN iv_str MATCH COUNT lv_style_tag_open IGNORING CASE.",
  "find value in text respecting case match offset off match length len.",
  "find foo-bar in xdata in byte mode match offset moff.",
  "FIND 'foo' IN TABLE lt_foobar MATCH LINE idx.",
  "FIND 'foo' IN SECTION OFFSET 100 OF text IGNORING CASE MATCH OFFSET moff.",
  "FIND REGEX '[^A-Za-z0-9_]' IN str IN CHARACTER MODE.",
  "FIND 'foo' IN TABLE tab FROM cline MATCH LINE cline.",
  "FIND FIRST OCCURRENCE OF REGEX lv_pattern IN SECTION OFFSET lv_offset LENGTH lv_strlen OF bar.",
  "find first occurrence of 'foo' in table lt_tab from line + 1 match line lv_res.",
  "FIND FIRST OCCURRENCE OF SUBSTRING 'BLAH' IN SECTION LENGTH 20 OF lv_foo MATCH COUNT l_count.",
  "FIND blah IN SECTION LENGTH 1 OF lv_value.",
  "find FIRST OCCURRENCE OF REGEX 'df' in SECTION OFFSET 30 LENGTH 10 of blah.",
];

statementType(tests, "FIND", Statements.Find);