import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "raise exception type zcx_root.",
  "RAISE EXCEPTION lx_root.",
  "RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc EXPORTING textid = /iwbep/cx_mgw_not_impl_exc=>method_not_implemented method = 'CREATE_DEEP_ENTITY'.",
];

statementType(tests, "RAISE", Statements.Raise);