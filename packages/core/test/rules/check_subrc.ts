import {CheckSubrc, CheckSubrcConf} from "../../src/rules/check_subrc";
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
  SELECT COUNT( * ) FROM foobar
  WHERE direction = @iv_direction
  AND created_on = @iv_created_on
  INTO @rv_count.`, cnt: 0},
  {abap: `
  SELECT COUNT(*) FROM foobar
  WHERE direction = @iv_direction
  AND created_on = @iv_created_on
  INTO @rv_count.`, cnt: 0},

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

  {abap: "FIND 'foo' IN TABLE tab FROM cline MATCH LINE cline.", cnt: 1},
  {abap: "FIND FIRST OCCURRENCE OF SUBSTRING 'BLAH' IN SECTION LENGTH 20 OF lv_foo MATCH COUNT l_count.", cnt: 0},
  {abap: "FIND REGEX 'blah' IN lv_statement SUBMATCHES lv_name.", cnt: 1},
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
  {abap: `SELECT SINGLE @abap_true FROM sdfds WHERE name = 'sdfsd'.`, cnt: 0},

// todo, this should be an error as SY-SUBRC is set?
  {abap: `
  DATA lcl_ref TYPE REF TO data.
  FIELD-SYMBOLS <restab_standatd> TYPE STANDARD TABLE.
  ASSIGN lcl_ref->* TO <restab_standatd>.
  IF <restab_standatd> IS NOT ASSIGNED.
  ENDIF.`, cnt: 0},

  {abap: `
TEST-SEAM tst_seam.
  READ TABLE local_table INTO DATA(table_data).
END-TEST-SEAM.

IF sy-subrc <> 0.
  WRITE 'ERROR'.
ENDIF.`, cnt: 0},

// this doesnt set subrc, so no issue should be reported
  {abap: `
DATA foo TYPE i.
FIELD-SYMBOLS <bar> TYPE any.
ASSIGN foo TO <bar>.`, cnt: 0},

  {abap: `DELETE FROM kernel_locks WHERE table_name = @ls_lock-table_name AND lock_key = @ls_lock-lock_key.`, cnt: 1},

// the check continues after the end of IF, CASE and TRY when the statement is in a branch
  {abap: `
IF foo = bar.
  READ TABLE tab INDEX 1 INTO row.
ELSEIF foo = 2.
  WRITE foo.
ELSE.
  READ TABLE tab INDEX 2 INTO row.
ENDIF.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
CASE foo.
  WHEN 1.
    READ TABLE tab INDEX 1 INTO row.
  WHEN OTHERS.
    CASE bar.
      WHEN 2.
        WRITE bar.
    ENDCASE.
ENDCASE.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
TRY.
    READ TABLE tab INDEX 1 INTO row.
  CATCH cx_root.
    TRY.
        WRITE foo.
      CATCH cx_root.
    ENDTRY.
ENDTRY.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
IF foo = bar.
  READ TABLE tab INDEX 1 INTO row.
ELSE.
  WRITE foo.
ENDIF.
WRITE bar.`, cnt: 1},
  {abap: `
READ TABLE tab INDEX 1 INTO row.
check_subrc( 'READ' ).`, cnt: 0},
  {abap: `
READ TABLE tab INDEX 1 INTO row.
lo_obj->subrc_to_exception( ).`, cnt: 0},
  {abap: `
READ TABLE tab INDEX 1 INTO row.
check( ).`, cnt: 1},
];

testRule(tests, CheckSubrc);

const callTests = [
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.`, cnt: 1},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.
WRITE 'hello'.
IF sy-subrc <> 0.
ENDIF.`, cnt: 1},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ##SUBRC_OK.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ##FM_SUBRC_OK.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.                                  "#EC CI_SUBRC`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    error_message = 1.`, cnt: 1},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = lv_rc.`, cnt: 1},
  {abap: `
CALL FUNCTION 'Z_READ'
  DESTINATION lv_dest
  EXCEPTIONS
    system_failure        = 1 MESSAGE lv_msg
    communication_failure = 2 MESSAGE lv_msg
    OTHERS                = 3.`, cnt: 1},
  {abap: `
CALL FUNCTION 'Z_READ'
  STARTING NEW TASK 'T'
  EXCEPTIONS
    system_failure        = 1 MESSAGE lv_msg
    communication_failure = 2 MESSAGE lv_msg
    resource_failure      = 3.`, cnt: 1},
// every exception mapped to 0, sy-subrc is always 0
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    OTHERS = 0.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 0
    OTHERS    = 0.`, cnt: 0},
// no EXCEPTIONS, the call does not set sy-subrc
  {abap: `
CALL FUNCTION 'Z_READ'
  EXPORTING
    iv_name = lv_name.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ' IN UPDATE TASK
  EXPORTING
    iv_name = lv_name.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ' IN BACKGROUND TASK
  EXPORTING
    iv_name = lv_name.`, cnt: 0},
  {abap: `
CALL FUNCTION 'Z_READ'
  PARAMETER-TABLE lt_params
  EXCEPTION-TABLE lt_exceptions.`, cnt: 0},
  {abap: `
IF foo = bar.
  CALL FUNCTION 'Z_READ'
    EXCEPTIONS
      OTHERS = 1.
ELSE.
  CALL FUNCTION 'Z_READ_OTHER'
    EXCEPTIONS
      OTHERS = 1.
ENDIF.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
TRY.
    CALL METHOD lo_obj->('DYNAMIC')
      EXCEPTIONS
        OTHERS = 1.
  CATCH cx_sy_dyn_call_param_not_found.
    lo_obj->static( EXCEPTIONS OTHERS = 1 ).
ENDTRY.
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},

// method calls
  {abap: `
CALL METHOD lo_obj->read
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.`, cnt: 1},
  {abap: `
lo_obj->read(
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ).`, cnt: 1},
  {abap: `
CALL METHOD lo_obj->read(
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ).`, cnt: 1},
  {abap: `
cl_abap_typedescr=>describe_by_name(
  EXPORTING
    p_name         = lv_name
  RECEIVING
    p_descr_ref    = lo_type
  EXCEPTIONS
    type_not_found = 1
    OTHERS         = 2 ).
IF sy-subrc <> 0.
ENDIF.`, cnt: 0},
  {abap: `
lo_obj->read(
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ).
check_subrc_for( 'READ' ).`, cnt: 0},
  {abap: `
lo_obj->read(
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ) ##SUBRC_OK.`, cnt: 0},
  {abap: `
lo_obj->read(
  EXCEPTIONS
    OTHERS = 0 ).`, cnt: 0},
  {abap: `lo_obj->read( ).`, cnt: 0},
  {abap: `lo_obj->read( iv_name ).`, cnt: 0},
  {abap: `
CALL METHOD lo_obj->read
  PARAMETER-TABLE lt_params
  EXCEPTION-TABLE lt_exceptions.`, cnt: 0},
];

testRule(callTests, CheckSubrc, undefined, "check_subrc, CALL FUNCTION and method calls");

const callOff = new CheckSubrcConf();
callOff.callFunction = false;
callOff.callMethod = false;

testRule([
  {abap: `
CALL FUNCTION 'Z_READ'
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2.`, cnt: 0},
  {abap: `
lo_obj->read(
  EXCEPTIONS
    not_found = 1
    OTHERS    = 2 ).`, cnt: 0},
], CheckSubrc, callOff, "check_subrc, callFunction and callMethod off");