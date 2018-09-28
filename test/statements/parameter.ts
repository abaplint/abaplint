import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

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
  "parameters foo radiobutton group 123.",
  "PARAMETERS foo TYPE bar-moo VALUE CHECK DEFAULT '*'.",
  "PARAMETER moo TYPE /foo/bar MODIF ID 011.",
  "PARAMETERS p_bar TYPE /foo/bar AS LISTBOX USER-COMMAND baar VISIBLE LENGTH 35.",
  "PARAMETERS value TYPE p LENGTH 5 DECIMALS 1.",
  "PARAMETERS p_foo USER-COMMAND 01 AS CHECKBOX.",
  "PARAMETERS p_data01 LIKE (p_type01) MODIF ID 01 VALUE CHECK.",
  "parameters bar like sy-ucomm.",
  "parameters bar like sy-ucomm memory id 123.",
];

statementType(tests, "PARAMETER", Statements.Parameter);