import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "generate report lv_name.",

  "generate report lv_name\n" +
  "  without selection-screen\n" +
  "  message lv_message\n" +
  "  include lv_include\n" +
  "  line lv_line\n" +
  "  word lv_word.",
];

statementType(tests, "GENERATE REPORT", Statements.GenerateReport);