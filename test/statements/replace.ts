import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "REPLACE ALL OCCURRENCES OF '<_--28C_DATA_--29>' IN lv_xml WITH '<DATA>'.",
  "REPLACE FIRST OCCURRENCE OF 'asdf' IN lv_xml WITH 'asdf'.",
  "REPLACE '&' IN asdf WITH 'foo'.",
  "REPLACE '#' WITH lv_index_str INTO lv_value.",
  "REPLACE '01' IN lv_file WITH '02' IN CHARACTER MODE.",
  "REPLACE '~' INTO <fs_ihttpnvp>-name WITH space.",
  "REPLACE REGEX '([^/])\s*$' IN filename WITH '$1/' .",
  "REPLACE ALL OCCURRENCES OF REGEX 'sdf' IN cv_xml WITH 'sdf' IGNORING CASE.",
];

statementType(tests, "REPLACE", Statements.Replace);