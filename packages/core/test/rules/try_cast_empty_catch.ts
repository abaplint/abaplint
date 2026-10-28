import {Version} from "../../src";
import {TryCastEmptyCatch} from "../../src/rules";
import {testRule, testRuleFix} from "./_utils";
import {IRedundantTest, inMethod, testSyntaxAfterFix, testVersions} from "./_redundant_code";

const cast = (cast: string, handler = "  CATCH cx_sy_move_cast_error.") =>
  inMethod("DATA o TYPE REF TO object.\nDATA s TYPE REF TO lsub.\nTRY.\n    " + cast + "\n" + handler + "\nENDTRY.");

const tests: IRedundantTest[] = [
  {abap: cast("s ?= o."), cnt: 1, fix: true},
  {abap: cast("s ?= ref."), cnt: 1, fix: true},
  {abap: cast("s ?= iref->ref."), cnt: 1, fix: true},
  {abap: cast("ref ?= o."), cnt: 1, fix: true},
  {abap: cast("s ?= o.", "  CATCH CX_SY_MOVE_CAST_ERROR."), cnt: 1, fix: true},
  {abap: inMethod("DATA i TYPE REF TO lif.\nDATA o TYPE REF TO object.\nTRY.\n    i ?= o.\n  CATCH cx_sy_move_cast_error.\nENDTRY."), cnt: 1, fix: true},
  {abap: inMethod(`DATA o TYPE REF TO object.
DATA s TYPE REF TO lsub.
TRY.
    TRY.
        s ?= o.
      CATCH cx_sy_move_cast_error.
    ENDTRY.
  CATCH cx_root.
ENDTRY.`), cnt: 1, fix: true},
  // generated code from abaplint-abap-classic
  {abap: inMethod(`    DATA t1 TYPE REF TO lsub.
    TRY.
    t1 ?= iref->ref.
    CATCH cx_sy_move_cast_error.
    ENDTRY.
    ref = t1.`), cnt: 1, fix: true},

  // other handlers
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error.\n    CLEAR s."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error INTO DATA(e)."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH cx_root."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error cx_sy_ref_is_initial."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error.\n  CATCH cx_root."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error.\n  CLEANUP.\n    CLEAR s."), cnt: 0},
  {abap: cast("s ?= o.", "  CATCH BEFORE UNWIND cx_sy_move_cast_error."), cnt: 0},
  {abap: cast("s ?= o.", "  \" ignore\n  CATCH cx_sy_move_cast_error."), cnt: 0},
  // other statements
  {abap: cast("s ?= o.\n    CLEAR o."), cnt: 0},
  {abap: cast("s ?= obj( )."), cnt: 0},
  {abap: cast("o = s."), cnt: 0},
  {abap: cast("s = CAST #( o )."), cnt: 0},
  // types
  {abap: inMethod("DATA o TYPE REF TO object.\nDATA o2 TYPE REF TO object.\nTRY.\n    o2 ?= o.\n  CATCH cx_sy_move_cast_error.\nENDTRY."), cnt: 0},
  {abap: inMethod("DATA d TYPE REF TO i.\nDATA dd TYPE REF TO data.\nTRY.\n    d ?= dd.\n  CATCH cx_sy_move_cast_error.\nENDTRY."), cnt: 0},
  {abap: inMethod("DATA v TYPE REF TO cl_gui_alv_grid.\nDATA o TYPE REF TO object.\nTRY.\n    v ?= o.\n  CATCH cx_sy_move_cast_error.\nENDTRY."), cnt: 0},
  // dynamic code, macros, syntax errors
  {abap: cast("s ?= o.", "  CATCH cx_sy_move_cast_error.\nENDTRY.\nASSIGN ('ATTR') TO FIELD-SYMBOL(<fs>).\nTRY."), cnt: 0},
  {abap: "DEFINE _cast.\n  &1 ?= &2.\nEND-OF-DEFINITION.\n" + cast("_cast s o."), cnt: 0},
  {abap: cast("s ?= o.\n    unknown = 1."), cnt: 0, syntaxError: true},
];

testRule(tests, TryCastEmptyCatch, undefined, "test try_cast_empty_catch rule");
testSyntaxAfterFix(tests, TryCastEmptyCatch);

testRuleFix([
  {
    input: inMethod(`    DATA o TYPE REF TO object.
    DATA s TYPE REF TO lsub.
    TRY.
        s ?= o.
      CATCH cx_sy_move_cast_error.
    ENDTRY.`),
    output: inMethod(`    DATA o TYPE REF TO object.
    DATA s TYPE REF TO lsub.
    IF o IS INSTANCE OF lsub OR o IS INITIAL.
        s ?= o.
    ENDIF.`),
  },
], TryCastEmptyCatch);

testVersions(cast("s ?= o."), TryCastEmptyCatch, [
  {version: Version.v740sp08, cnt: 0},
  {version: Version.v750, cnt: 1},
  {version: Version.OpenABAP, cnt: 1},
  {version: Version.Cloud, cnt: 1},
]);
