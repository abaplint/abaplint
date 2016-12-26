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
];

statementType(tests, "FIND", Statements.Find);