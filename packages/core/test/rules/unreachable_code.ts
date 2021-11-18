import {UnreachableCode} from "../../src/rules";
import {testRule} from "./_utils";

const tests = [
  {abap: "parser error", cnt: 0},
  {abap: "WRITE 'hello'.", cnt: 0},
  {abap: `RETURN.
            WRITE 'hello'.`, cnt: 1},

  {abap: `IF foo = bar.
            RETURN.
          ENDIF.
          WRITE 'hello'.`, cnt: 0},

  {abap: `FORM bar.
  RETURN.
  WRITE 2.
  WRITE 2.
ENDFORM.`, cnt: 1},

  {abap: `IF foo = bar.
            RETURN. " comment
          ENDIF.
          WRITE 'hello'.`, cnt: 0},

  {abap: `SUBMIT zrest
            WITH s_messag IN sdfsd TO SAP-SPOOL SPOOL PARAMETERS ls_pr
            WITH OUT SPOOL DYNPRO VIA JOB gv_jobname NUMBER lv_jobcnt AND RETURN.
          IF sy-subrc EQ 0.
          ENDIF.`, cnt: 0},

  {abap: `LEAVE TO LIST-PROCESSING AND RETURN TO SCREEN 0.
          WRITE moo.`, cnt: 0},

  {abap: `FORM foo.
  WRITE 'hello'.
  LEAVE TO LIST-PROCESSING.
  WRITE 'world'.
ENDFORM.`, cnt: 0},

  {abap: `CASE sy-subrc.
WHEN 0.
WHEN 2.
  RAISE EXCEPTION TYPE zcx_abapgit_cancel.
WHEN OTHERS.
  zcx_abapgit_exception=>raise( 'Error from COMPLEX_SELECTIONS_DIALOG' ).
ENDCASE.`, cnt: 0},

];

testRule(tests, UnreachableCode);