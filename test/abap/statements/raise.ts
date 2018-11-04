import {statementType, statementVersion} from "../_utils";
import * as Statements from "../../../src/abap/statements/";
import {Version} from "../../../src/version";

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
  "RAISE EXCEPTION lr_/foo/cx_bar.",
];

statementType(tests, "RAISE", Statements.Raise);


let versions = [
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID sy-msgid TYPE sy-msgty" +
    " NUMBER sy-msgno WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZFOO' TYPE 'E' NUMBER 001.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_bar MESSAGE e000(zp_foo) WITH lv_moo.", ver: Version.v750},
  {abap: "RAISE EXCEPTION TYPE zcx_foobar MESSAGE ID 'ZFOO' TYPE 'E' NUMBER 001 WITH bar.", ver: Version.v750},
];

statementVersion(versions, "RAISE", Statements.Raise);