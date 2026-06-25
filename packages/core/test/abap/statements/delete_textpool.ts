import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DELETE TEXTPOOL ls_foo-name.",
  "DELETE TEXTPOOL iv_program LANGUAGE iv_program STATE lv_state.",
  "DELETE TEXTPOOL lv_pool LANGUAGE '*'.",
];

statementType(tests, "DELETE TEXTPOOL", Statements.DeleteTextpool);

const versionsFail = [
  {abap: `DELETE TEXTPOOL ls_foo-name.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DELETE TEXTPOOL");
