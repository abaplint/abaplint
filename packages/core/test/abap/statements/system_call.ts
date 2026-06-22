import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "system-call query class ls_class-clsname.",
  "SYSTEM-CALL OBJMGR CLONE me TO result.",
  `SYSTEM-CALL ict
  DID
    ihttp_scid_base64_escape_x
  PARAMETERS
    tmp_s
    lv_string
    c_last_error.`,

  `SYSTEM-CALL ICT
    DID
      ihttp_scid_jscript_escape
    PARAMETERS
      unescaped
      escaped
      options
      c_last_error.`,
];

statementType(tests, "SYSTEM-CALL", Statements.SystemCall);

const versionsFail = [
  {abap: `system-call query class ls_class-clsname.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SYSTEM-CALL");
