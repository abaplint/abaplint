import {CheckSubrc} from "../../src/rules/check_subrc";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE hello.", cnt: 0},
  {abap: "OPEN DATASET lv_file_name FOR OUTPUT IN BINARY MODE.", cnt: 1},
  {abap: `
  OPEN DATASET lv_file_name FOR OUTPUT IN BINARY MODE.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},
  {abap: `
SELECT SINGLE * FROM tadir INTO CORRESPONDING FIELDS OF rs_tadir
WHERE pgmid = iv_pgmid
AND object = iv_object
AND obj_name = iv_obj_name.                       "#EC CI_SUBRC`, cnt: 0},
  {abap: `
SELECT SINGLE parentcl FROM tdevc INTO rv_parentcl
WHERE devclass = mv_package.        "#EC CI_GENBUFF
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},

  {abap: `
IF foo = bar.
  SELECT SINGLE object FROM tadir INTO lv_object
    WHERE pgmid = 'R3TR'
    AND object IN ('CLAS','ENHS','CUS0','CUS1','CUS2')
    AND obj_name = iv_encl_object.
ENDIF.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},

  {abap: `
READ TABLE lt_results WITH KEY object = 'DTEL' obj_name = 'XMILOGID' TRANSPORTING NO FIELDS.
cl_abap_unit_assert=>assert_subrc( ).`, cnt: 0},

];

testRule(tests, CheckSubrc);