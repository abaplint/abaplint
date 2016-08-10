import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INSERT ls_stage INTO TABLE mt_stage.",
  "INSERT <ls_list>-icfhandler INTO TABLE rt_list.",
  "INSERT ls_font_cache INTO TABLE mth_font_cache ASSIGNING <ls_font_cache>.",
  "INSERT ls_theme INTO _themes_for_templates INDEX 1.",
  "INSERT LINES OF lt_comp INTO TABLE components.",
];

statementType(tests, "INSERT", Statements.InsertInternal);