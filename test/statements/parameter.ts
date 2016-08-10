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
  "PARAMETERS rb_down RADIOBUTTON GROUP rb1 USER-COMMAND space.",
  "PARAMETERS p_mail TYPE so_dli_nam OBLIGATORY MATCHCODE OBJECT zfoobar.",
  "PARAMETERS p_backfn TYPE text40 NO-DISPLAY.",
  "PARAMETERS cb_errl AS CHECKBOX DEFAULT 'X'.",
  "PARAMETER p_top  TYPE i DEFAULT 100 OBLIGATORY."
];

statementType(tests, "PARAMETER", Statements.Parameter);