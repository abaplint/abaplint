import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "END-OF-PAGE.",
];

statementType(tests, "END-OF-PAGE", Statements.EndOfPage);

const versionsFail = [
  {abap: `END-OF-PAGE.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "END-OF-PAGE");
