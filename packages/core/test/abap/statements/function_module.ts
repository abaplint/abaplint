import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  // plain
  "FUNCTION zfoo.",
  "FUNCTION yspd_fm_sc_rms_background_job.",

  // full bug-report line
  "FUNCTION yspd_fm_sc_rms_background_job IMPORTING VALUE(iv_jobname) TYPE btcjob OPTIONAL " +
    "VALUE(iv_timestamps) TYPE string OPTIONAL VALUE(iv_date) TYPE yspd_de_datum OPTIONAL " +
    "EXPORTING VALUE(ev_jobcount) TYPE btcjobcnt.",

  // each clause individually
  "FUNCTION zfoo IMPORTING VALUE(iv_a) TYPE string.",
  "FUNCTION zfoo IMPORTING REFERENCE(iv_a) TYPE string.",
  "FUNCTION zfoo IMPORTING iv_a TYPE string.",
  "FUNCTION zfoo EXPORTING VALUE(ev_a) TYPE string.",
  "FUNCTION zfoo EXPORTING ev_a TYPE string.",
  "FUNCTION zfoo CHANGING VALUE(cv_a) TYPE string.",
  "FUNCTION zfoo CHANGING cv_a TYPE string OPTIONAL.",

  // type-less classic importing param (where MethodParam fails)
  "FUNCTION zfoo IMPORTING iv_a.",
  "FUNCTION zfoo IMPORTING iv_a iv_b iv_c.",

  // OPTIONAL / DEFAULT / LIKE
  "FUNCTION zfoo IMPORTING VALUE(iv_a) TYPE string OPTIONAL.",
  "FUNCTION zfoo IMPORTING VALUE(iv_a) TYPE i DEFAULT 1.",
  "FUNCTION zfoo IMPORTING iv_a LIKE sy-datum.",

  // table typing on a normal param
  "FUNCTION zfoo IMPORTING iv_a TYPE STANDARD TABLE.",

  // TABLES forms
  "FUNCTION zfoo TABLES it_a STRUCTURE dbtab.",
  "FUNCTION zfoo TABLES it_a TYPE ty_tab.",
  "FUNCTION zfoo TABLES it_a.",
  "FUNCTION zfoo TABLES it_a STRUCTURE dbtab it_b TYPE ty_tab it_c.",

  // EXCEPTIONS
  "FUNCTION zfoo EXCEPTIONS not_found.",
  "FUNCTION zfoo EXCEPTIONS not_found system_failure others.",

  // RAISING (modern)
  "FUNCTION zfoo RAISING cx_static_check.",
  "FUNCTION zfoo RAISING cx_a cx_b.",
  "FUNCTION zfoo RAISING RESUMABLE(cx_a).",

  // combined canonical-order line
  "FUNCTION zfoo IMPORTING VALUE(iv_a) TYPE i OPTIONAL REFERENCE(iv_b) TYPE string " +
    "EXPORTING ev_a TYPE i " +
    "CHANGING cv_a TYPE string " +
    "TABLES it_a STRUCTURE dbtab it_b TYPE ty_tab " +
    "EXCEPTIONS not_found others.",

  // combined with RAISING instead of EXCEPTIONS
  "FUNCTION zfoo IMPORTING iv_a TYPE i EXPORTING ev_a TYPE i RAISING cx_static_check.",
];

statementType(tests, "FUNCTION", Statements.FunctionModule);
