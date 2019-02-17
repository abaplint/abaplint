import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "INSERT REPORT is_progdir-name FROM it_source STATE 'I' PROGRAM TYPE is_progdir-subc.",
  "INSERT REPORT lv_include FROM lt_source.",
  "insert report lv_include from lt_content extension type p_extension.",
  "INSERT REPORT lv_name FROM tab EXTENSION TYPE ext DIRECTORY ENTRY entry.",
  "INSERT REPORT lv_name FROM tab EXTENSION TYPE ext STATE 'A'.",
  "insert report lv_name from tab state 'A' extension type 'CM' KEEPING DIRECTORY ENTRY.",
  "INSERT REPORT name FROM prog UNICODE ENABLING 'X'.",
  "INSERT REPORT name FROM prog FIXED-POINT ARITHMETIC 'X'.",
];

statementType(tests, "INSERT REPORT", Statements.InsertReport);