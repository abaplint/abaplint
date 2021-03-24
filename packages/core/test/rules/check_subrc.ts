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
SELECT SINGLE * FROM tadir INTO CORRESPONDING FIELDS OF rs_tadir
WHERE pgmid = iv_pgmid
AND object = iv_object
AND obj_name = iv_obj_name ##SUBRC_OK.`, cnt: 0},
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

  {abap: `
READ TABLE ct_failed_objects ASSIGNING <lfs_failed_objects> INDEX 1.
IF <lfs_failed_objects> IS ASSIGNED.
ENDIF.`, cnt: 0},

  {abap: `
UPDATE zabaplint_pack
  SET json = iv_json
  WHERE devclass = iv_devclass.
ASSERT sy-dbcnt = 1.`, cnt: 0},

  {abap: `
DATA bar TYPE i VALUE 1.
SELECT *
  INTO TABLE @DATA(lt_tab)
  FROM voided
  WHERE foo = @bar
  ORDER BY PRIMARY KEY.`, cnt: 1},

  {abap: "FIND 'foo' IN TABLE tab FROM cline MATCH LINE cline.", cnt: 0},
  {abap: "FIND FIRST OCCURRENCE OF SUBSTRING 'BLAH' IN SECTION LENGTH 20 OF lv_foo MATCH COUNT l_count.", cnt: 0},
  {abap: "FIND REGEX 'blah' IN lv_statement SUBMATCHES lv_name.", cnt: 0},
  {abap: "FIND 'blah' IN TABLE t_source IGNORING CASE.", cnt: 1},

// ASSIGN, non dynamic variant, no subrc is set
  {abap: `
  ASSIGN foo TO <left_operand>.
  IF <left_operand> IS ASSIGNED.
  ENDIF.`, cnt: 0},

// todo, this should be an error?
  {abap: `
  ASSIGN foo TO <left_operand>.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},

// ASSIGN, 4 dynamic variants, these sets subrc
  {abap: `
  ASSIGN (name) TO <left_operand>.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},
  {abap: `
  ASSIGN dref->* TO <left_operand>.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},
  {abap: `
  ASSIGN dobj INCREMENT inc TO <left_operand>.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},
  {abap: `
  ASSIGN COMPONENT comp OF STRUCTURE struc TO <left_operand>.
  IF sy-subrc = 0.
  ENDIF.`, cnt: 0},

// todo, this should be an error as SY-SUBRC is set?
  {abap: `
  DATA lcl_ref TYPE REF TO data.
  FIELD-SYMBOLS <restab_standatd> TYPE STANDARD TABLE.
  ASSIGN lcl_ref->* TO <restab_standatd>.
  IF <restab_standatd> IS NOT ASSIGNED.
  ENDIF.`, cnt: 0},
];

testRule(tests, CheckSubrc);