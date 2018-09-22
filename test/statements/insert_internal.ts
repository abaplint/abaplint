import {statementType, statementVersion} from "../utils";
import * as Statements from "../../src/abap/statements/";
import {Version} from "../../src/version";

let tests = [
  "INSERT INITIAL LINE INTO ct_diff INDEX lv_index.",
  "INSERT INITIAL LINE INTO bar ASSIGNING <sdf> INDEX lv_tabix.",
  "insert initial line into lt_table reference into lr_ref index lv_index.",
  "INSERT ls_stage INTO TABLE mt_stage.",
  "INSERT <ls_list>-icfhandler INTO TABLE rt_list.",
  "INSERT lt_table INDEX lv_index.",
  "INSERT ls_font_cache INTO TABLE mth_font_cache ASSIGNING <ls_font_cache>.",
  "INSERT ls_theme INTO _themes_for_templates INDEX 1.",
  "INSERT LINES OF lt_comp INTO TABLE components.",
  "INSERT LINES OF lt_table FROM lv_from TO lv_to INTO TABLE lt_result.",
  "INSERT LINES OF lt_table FROM lv_from INTO TABLE et_merge_table.",
];

statementType(tests, "INSERT", Statements.InsertInternal);


let versions = [
  {abap: "INSERT NEW zcl_foobar( ) INTO TABLE lt_tab ASSIGNING FIELD-SYMBOL(<fs>).", ver: Version.v740sp02},
];

statementVersion(versions, "INSERT internal", Statements.InsertInternal);