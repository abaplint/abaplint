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
];

statementType(tests, "FIND", Statements.Find);