import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SELECT-OPTIONS foo FOR bar.",
  "SELECT-OPTIONS s_trkorr FOR e070-trkorr.",
  "SELECT-OPTIONS s_trkorr FOR e070-trkorr OBLIGATORY.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar MEMORY ID zfoo.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO-EXTENSION.",
  "SELECT-OPTIONS F1 FOR foo-bar VISIBLE LENGTH 20 MODIF ID F1.",
  "SELECT-OPTIONS s_matnr FOR mara-matnr MODIF ID sel.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO-EXTENSION NO INTERVALS.",
  "SELECT-OPTIONS s_qnum FOR aqgqcat-qnum MATCHCODE OBJECT zquery.",
  "SELECT-OPTIONS s_num FOR aqgqcat-num OBLIGATORY DEFAULT 'ASDF'.",
  "SELECT-OPTIONS s_moo FOR zfoo-bar NO INTERVALS MEMORY ID zfoo.",
  "SELECT-OPTIONS s_icon FOR icon-name DEFAULT 'foo' OPTION CP.",
  "SELECT-OPTIONS foo FOR (foo=>bar).",
  "select-options bar for foo no-display.",
  "SELECT-OPTIONS s_foo FOR bar DEFAULT 'AA' TO 'ZZ'.",
  "SELECT-OPTIONS s_bar FOR foo-bar NO-EXTENSION OBLIGATORY.",
  "SELECT-OPTIONS s_att FOR _att NO INTERVALS LOWER CASE.",
  "SELECT-OPTIONS s_id FOR /foo/bar-id NO INTERVALS.",
  "SELECT-OPTIONS so_fr FOR from MODIF ID 123.",
  "SELECT-OPTIONS s_startd FOR w_startd DEFAULT sy-datum TO sy-datum.",
  "SELECT-OPTIONS sp$00004 FOR moo-boo MEMORY ID foo.",
  "SELECT-OPTIONS s_name FOR field NO DATABASE SELECTION.",
  "SELECT-OPTIONS s_field FOR table-field DEFAULT 'A' OPTION EQ SIGN E.",
  "select-options date for <fs_booking>-date.",
];

statementType(tests, "SELECT-OPTIONS", Statements.SelectOption);