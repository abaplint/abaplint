import {testRule} from "./_utils";
import {UnnecessaryPragma} from "../../src/rules/unnecessary_pragma";

const tests = [
  {abap: `parser error`, cnt: 0},

  {abap: `
    TRY.
      CATCH zcx_abapgit_exception ##no_handler.
        RETURN. "previous XML version or no IDoc segment
    ENDTRY.`, cnt: 1},

  {abap: `
    TRY.
      CATCH cx_sy_dyn_call_illegal_method ##NO_HANDLER.
* SICF might not be supported in some systems, assume this code is not called
    ENDTRY.`, cnt: 0},

  {abap: `
    TRY.
      CATCH zcx_abapgit_cancel ##NO_HANDLER.
        " Do nothing = gc_event_state-no_more_act
      CATCH zcx_abapgit_exception INTO lx_exception.
        ROLLBACK WORK.
        handle_error( lx_exception ).
    ENDTRY.`, cnt: 0},

  {abap: `
TRY.
CATCH zcx_abapgit_exception.                      "#EC NO_HANDLER
  cl_abap_unit_assert=>fail( ).
ENDTRY.`, cnt: 1},

  {abap: `
TRY.
CATCH zcx_abapgit_exception.
  cl_abap_unit_assert=>fail( ).
ENDTRY.`, cnt: 0},

  {abap: `WRITE 'hello' ##NO_TEXT.`, cnt: 0},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message ##NO_TEXT.`, cnt: 1},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message.`, cnt: 0},
  {abap: `MESSAGE w125(zbar) WITH c_foo INTO message ##NEEDED ##NO_TEXT.`, cnt: 2},
];

testRule(tests, UnnecessaryPragma);