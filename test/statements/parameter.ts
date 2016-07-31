import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PARAMETERS p_insp TYPE sciins_inf-inspecname OBLIGATORY.",
  "PARAMETERS p_glob TYPE c RADIOBUTTON GROUP g1 DEFAULT 'X'.",
  "parameters p_user   TYPE sci_dynp-usr DEFAULT sy-uname.",
  "PARAMETERS p_objs   TYPE sci_dynp-i_objs OBLIGATORY.",
  "PARAMETER p_local  RADIOBUTTON GROUP g1.",
  "PARAMETER p_top  TYPE i DEFAULT 100 OBLIGATORY."
];

statementType(tests, "PARAMETER", Statements.Parameter);