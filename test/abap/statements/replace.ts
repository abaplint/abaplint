import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "REPLACE ALL OCCURRENCES OF '<_--28C_DATA_--29>' IN lv_xml WITH '<DATA>'.",
  "REPLACE FIRST OCCURRENCE OF 'asdf' IN lv_xml WITH 'asdf'.",
  "REPLACE '&' IN asdf WITH 'foo'.",
  "REPLACE '#' WITH lv_index_str INTO lv_value.",
  "REPLACE SECTION OFFSET lv_off OF lv_value WITH ' '.",
  "REPLACE '01' IN lv_file WITH '02' IN CHARACTER MODE.",
  "REPLACE '~' INTO <fs_ihttpnvp>-name WITH space.",
  "REPLACE REGEX '([^/])\s*$' IN filename WITH '$1/' .",
  "REPLACE ALL OCCURRENCES OF REGEX 'sdf' IN cv_xml WITH 'sdf' IGNORING CASE.",
  "replace section offset lv_off length 1 of <src> with char.",
  "REPLACE ALL OCCURRENCES OF `''` IN TABLE code WITH `bar`.",
  "replace all occurrences of '0' in section length lv_len OF lv_val with ` `.",
  "REPLACE ALL OCCURRENCES OF REGEX regx IN foo WITH repl RESPECTING CASE.",
  "REPLACE SECTION OFFSET lv_offset LENGTH 1 OF lv_bytes WITH lv_with IN BYTE MODE.",
  "REPLACE ALL OCCURRENCES OF SUBSTRING '#' IN foo-bar WITH '##'.",
  "REPLACE ALL OCCURRENCES OF '@' IN foo WITH 'at' REPLACEMENT COUNT count.",
  "REPLACE REGEX `blah` IN <line> WITH 'moo'.",
  "REPLACE ALL OCCURRENCES OF '?' IN foo WITH space IN CHARACTER MODE IGNORING CASE.",
  "replace lv_foo with lv_space into lv_command length lv_length.",
  "replace all occurences of `1` in lv_foo with lv_bar.",
  "REPLACE FIRST OCCURRENCE OF lv_str IN SECTION OFFSET lv_offset OF lv_of WITH lv_with IN BYTE MODE REPLACEMENT OFFSET lv_offset.",
  "replace first occurrence of foo-bar in lv_source with moo-boo replacement offset lv_offset replacement length lv_length ignoring case.",
  "REPLACE foo LENGTH lv_len2 WITH space INTO lv_result.",
  "REPLACE 'AA' LENGTH 2 WITH something INTO target.",
];

statementType(tests, "REPLACE", Statements.Replace);