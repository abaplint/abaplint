import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CALL 'SYST_LOGOFF'.",
  "CALL 'INTERNET_USER_LOGON' ID 'AUTHTYPE' FIELD AUTH_METHOD ID 'TESTMODE' FIELD SPACE.",
  "call funcname id 'FOO' field lv_foo id 'BAR' field lv_bar.",
];

statementType(tests, "CALL kernel", Statements.CallKernel);

const versionsFail = [
  {abap: `CALL 'SYST_LOGOFF'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CALL kernel");
