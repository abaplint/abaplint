import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "STATICS foo TYPE c.",
  "STATICS st_obj_serializer_map TYPE SORTED TABLE OF ty_obj_serializer_map WITH UNIQUE KEY item.",
  "statics tx_title(40) type c.",
  "statics l_heading.",
  "STATICS sv_first TYPE abap_bool VALUE abap_true.",
  "STATICS asdf/foo/bar TYPE i.",
  "STATICS stat(255).",
];

statementType(tests, "STATIC", Statements.Static);