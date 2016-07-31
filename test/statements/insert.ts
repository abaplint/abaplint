import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT tactz FROM TABLE lt_tactz.",
  "INSERT ls_stage INTO TABLE mt_stage.",
  "INSERT <ls_list>-icfhandler INTO TABLE rt_list.",
  "INSERT ls_font_cache INTO TABLE mth_font_cache ASSIGNING <ls_font_cache>.",
  "INSERT LINES OF lt_comp INTO TABLE components.",
  "INSERT (c_tabname) FROM ls_table.",
];

statementType(tests, "INSERT", Statements.Insert);