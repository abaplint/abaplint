import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "raise exception type zcx_root.",
  "RAISE EXCEPTION lx_root.",
  "RAISE RESUMABLE EXCEPTION TYPE zcx_foobar.",
  "RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc.",
  "RAISE EXCEPTION TYPE /iwbep/cx_mgw_not_impl_exc EXPORTING textid = \n" +
    "/iwbep/cx_mgw_not_impl_exc=>method_not_implemented method = 'CREATE_DEEP_ENTITY'.",
  "RAISE RESUMABLE EXCEPTION TYPE zcx_error EXPORTING textid = zcx_error=>some_values_too_high.",
  "RAISE EXCEPTION me->dd_sobject_store-exception.",
];

statementType(tests, "RAISE", Statements.Raise);