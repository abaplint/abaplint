import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL 'SYST_LOGOFF'.",
  "CALL 'INTERNET_USER_LOGON' ID 'AUTHTYPE' FIELD AUTH_METHOD ID 'TESTMODE' FIELD SPACE.",
];

statementType(tests, "CALL kernel", Statements.CallKernel);