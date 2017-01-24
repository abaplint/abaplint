import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "RECEIVE RESULTS FROM FUNCTION 'ZFOOBAR'\n" +
  " IMPORTING\n" +
  "   ev_foo      = lv_del\n" +
  " EXCEPTIONS\n" +
  "   initial_guid     = 1\n" +
  "   no_authorization = 2\n" +
  "   others           = 3.",

  "RECEIVE RESULTS FROM FUNCTION 'ZFOOBAR'\n" +
  "  KEEPING TASK\n" +
  "  TABLES\n" +
  "    tab = lt_tab.",

  "RECEIVE RESULTS FROM FUNCTION 'ZFOOBAR'\n" +
  "  CHANGING\n" +
  "    cv_foo = moo\n" +
  "    cs_boo = bar\n" +
  "  EXCEPTIONS\n" +
  "    OTHERS = 1.",

];

statementType(tests, "RECEIVE", Statements.Receive);