import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CREATE OBJECT lo_obj.",
  "CREATE OBJECT go_lencode EXPORTING it_lengths = lt_lengths.",
  "CREATE OBJECT mo_plugin TYPE (ls_objtype_map-plugin_class).",
  "CREATE OBJECT lo_source EXPORTING clskey = is_clskey EXCEPTIONS sdfd = 1 OTHERS = 2.",
  "CREATE OBJECT ei_page TYPE lcl_gui_page_commit EXPORTING io_repo  = mo_repo io_stage = mo_stage.",
];

statementType(tests, "CREATE", Statements.Create);