import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CREATE OBJECT lo_obj.",
  "CREATE OBJECT go_lencode EXPORTING it_lengths = lt_lengths.",
  "CREATE OBJECT mo_plugin TYPE (ls_objtype_map-plugin_class).",
  "CREATE OBJECT lo_source EXPORTING clskey = is_clskey EXCEPTIONS sdfd = 1 OTHERS = 2.",
  "CREATE OBJECT ei_page TYPE lcl_gui_page_commit EXPORTING io_repo  = mo_repo io_stage = mo_stage.",
  "CREATE OBJECT lo_ref TYPE (lv_classname) PARAMETER-TABLE lt_otab.",
  "CREATE OBJECT lo_root AREA HANDLE lo_area.",
  "CREATE OBJECT lo_root AREA HANDLE io_handle TYPE (lv_name) EXPORTING iv_name = lv_name.",
];

statementType(tests, "CREATE OBJECT", Statements.CreateObject);