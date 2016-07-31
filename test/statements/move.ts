import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "move 2 to lv_foo.",
  "lv_foo = 2.",
  "rs_data-raw = gv_out.",
  "rv_bool = boolc( sy-subrc = 0 ).",
  "rs_data-compressed_len = xstrlen( foo ).",
  "lo_repo ?= lcl_app=>repo_srv( )->get( <ls_list>-key ).",
  "rs_data-compressed_len = xstrlen( foo ) - 2.",
  "rs_data-compressed_len = xstrlen( foo ) - field.",
  "rs_data-compressed_len = xstrlen( foo ) - foo( ).",
  "rs_data-compressed_len = xstrlen( foo ) - go_stream->remaining( ).",
];

statementType(tests, "MOVE", Statements.Move);