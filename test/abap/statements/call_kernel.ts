import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CALL 'SYST_LOGOFF'.",
  "CALL 'INTERNET_USER_LOGON' ID 'AUTHTYPE' FIELD AUTH_METHOD ID 'TESTMODE' FIELD SPACE.",
  "call funcname id 'FOO' field lv_foo id 'BAR' field lv_bar.",
];

statementType(tests, "CALL kernel", Statements.CallKernel);