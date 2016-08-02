import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "move 2 to lv_foo.",
  "lv_foo = 2.",
  "rs_data-raw = gv_out.",
  "rv_bool = boolc( sy-subrc = 0 ).",
  "rs_data-compressed_len = xstrlen( foo ).",
  "lo_repo ?= lcl_app=>repo_srv( )->get( <ls_list>-key ).",
  "wa_asdf-cur = sy-tabix * ( -1 ).",
  "move asdf to foobar(3).",
  "lv_sdf = lv_dfd BIT-XOR lv_hex.",
  "foo = 'sdf' & 'sdf'.",
  "lv_foo = 'something'(002).",
  "lv_foo = 'foobar'(bl1).",
  "rs_data-len = xstrlen( foo ) - 2.",
  "rs_data-len = xstrlen( foo ) - field.",
  "rs_data-len = xstrlen( foo ) - foo( ).",
  "rs_data-len = xstrlen( foo ) - go_stream->rema( ).",
];

statementType(tests, "MOVE", Statements.Move);