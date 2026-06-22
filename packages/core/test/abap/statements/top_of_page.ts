import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "top-of-page.",
  "top-of-page during line-selection.",
];

statementType(tests, "TOP-OF-PAGE", Statements.TopOfPage);

const versionsFail = [
  {abap: `top-of-page.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TOP-OF-PAGE");
