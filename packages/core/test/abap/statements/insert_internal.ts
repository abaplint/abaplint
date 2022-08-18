import {statementExpectFail, statementType, statementVersion, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
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
  "INSERT node_tmp INTO TABLE mt_json_tree REFERENCE INTO node_ref.",
  "INSERT TABLE lt_foobar.",
  `INSERT VALUE #(
    tabname        = <ls_f4_group>-tabname
    fieldname      = <ls_f4_group>-fieldname
    f4_definitions = VALUE zdbbr_f4_data_itab( FOR f4 IN GROUP <ls_f4_group> ( f4 ) )
    ) INTO TABLE mt_custom_f4_map.`,
  `INSERT LINES OF sorted_scores TO hits INTO TABLE result.`,
  "INSERT row INTO tab INDEX 1 ASSIGNING <fs>.",
  "INSERT row INTO tab ASSIGNING <fs> INDEX 1.",
  "INSERT str INTO tab.",
  "INSERT tab INDEX 1.",
  "INSERT tab INDEX 1 ASSIGNING <fs>.",
  "INSERT tab ASSIGNING <fs> INDEX 1.",
];

statementType(tests, "INSERT", Statements.InsertInternal);

const toFail = [
  "INSERT row REFERENCE INTO ref INTO table tab.",
  "INSERT ls_copy INTO TABLE ms_spec-components-schemas INDEX 1.",
  "INSERT row INTO TABLE tab REFERENCE INTO ref ASSIGNING <fs>.",
  "INSERT row INTO tab REFERENCE INTO ref ASSIGNING <fs>.",
  /*
  "INSERT row INDEX 1 INTO tab.",
  "INSERT row ASSIGNING <fs> INTO table tab.",
  */
];
statementExpectFail(toFail, "INSERT");

const versions = [
  {abap: "INSERT NEW zcl_foobar( ) INTO TABLE lt_tab ASSIGNING FIELD-SYMBOL(<fs>).", ver: Version.v740sp02},
  {abap: "insert |field_more| into table ls_result-struc_data-field_more.", ver: Version.v740sp02},
];

statementVersion(versions, "INSERT internal", Statements.InsertInternal);

const versionsFail = [
  {abap: "insert |field_more| into table ls_result-struc_data-field_more.", ver: Version.v702},
];

statementVersionFail(versionsFail, "INSERT internal");