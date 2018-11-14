import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "STATICS foo TYPE c.",
  "STATICS st_obj_serializer_map TYPE SORTED TABLE OF ty_obj_serializer_map WITH UNIQUE KEY item.",
  "statics tx_title(40) type c.",
  "statics l_heading.",
  "STATICS sv_first TYPE abap_bool VALUE abap_true.",
  "STATICS asdf/foo/bar TYPE i.",
  "STATICS stat(255).",
  "STATICS lv_stat1 TYPE c LENGTH 1.",
  "STATICS lv_stat2 LENGTH 1 TYPE c.",
];

statementType(tests, "STATIC", Statements.Static);