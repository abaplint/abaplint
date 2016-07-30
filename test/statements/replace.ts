import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "REPLACE ALL OCCURRENCES OF '<_--28C_DATA_--29>' IN lv_xml WITH '<DATA>'.",
  "REPLACE FIRST OCCURRENCE OF 'asdf' IN lv_xml WITH 'asdf'.",
  "REPLACE ALL OCCURRENCES OF REGEX 'sdf' IN cv_xml WITH 'sdf' IGNORING CASE.",
];

statementType(tests, "REPLACE", Statements.Replace);