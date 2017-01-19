import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PARAMETERS p_insp TYPE sciins_inf-inspecname OBLIGATORY.",
  "PARAMETERS p_glob TYPE c RADIOBUTTON GROUP g1 DEFAULT 'X'.",
  "parameters p_user   TYPE sci_dynp-usr DEFAULT sy-uname.",
  "PARAMETERS p_objs   TYPE sci_dynp-i_objs OBLIGATORY.",
  "PARAMETERS p_foobar   TYPE sdfs LOWER CASE DEFAULT 'asdf'.",
  "PARAMETERS p_up TYPE string LOWER CASE MEMORY ID gr8.",
  "PARAMETERS write TYPE asdf AS LISTBOX VISIBLE LENGTH 40 LOWER CASE OBLIGATORY DEFAULT 'sdf'.",
  "PARAMETER p_local  RADIOBUTTON GROUP g1.",
  "PARAMETERS p_path  TYPE string LOWER CASE MODIF ID pat.",
  "parameter p_def type c default ' ' as checkbox.",
  "parameters p_size default 1000 type i.",
  "PARAMETERS rb_down RADIOBUTTON GROUP rb1 USER-COMMAND space.",
  "PARAMETERS p_mail TYPE so_dli_nam OBLIGATORY MATCHCODE OBJECT zfoobar.",
  "PARAMETER p_url  TYPE string LOWER CASE VISIBLE LENGTH 40.",
  "PARAMETERS p_backfn TYPE text40 NO-DISPLAY.",
  "PARAMETERS cb_errl AS CHECKBOX DEFAULT 'X'.",
  "PARAMETER p_top  TYPE i DEFAULT 100 OBLIGATORY.",
  "PARAMETERS p_aid LIKE toaom-archiv_id OBLIGATORY.",
  "PARAMETERS p_file(128) TYPE c LOWER CASE OBLIGATORY DEFAULT 'C:\filename.xls'.",
  "PARAMETERS p_mail TYPE c LENGTH 40 LOWER CASE.",
  "PARAMETERS moo-boo LIKE foo-bar.",
];

statementType(tests, "PARAMETER", Statements.Parameter);