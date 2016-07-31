import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FIND REGEX 'blah' IN lv_statement SUBMATCHES lv_name.",
  "FIND FIRST OCCURRENCE OF REGEX lo_regex IN <ls_diff>-local.",
  "FIND FIRST OCCURRENCE OF '.' IN lv_code_line MATCH OFFSET lv_offs.",
  "FIND ALL OCCURRENCES OF '/' IN <ls_folder>-path MATCH COUNT <ls_folder>-count.",
  "FIND REGEX '(.*/)(.*)' IN iv_str SUBMATCHES lv_path rv_filename.",
];

statementType(tests, "FIND", Statements.Find);