import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `ENDCATCH.`,
];

statementType(tests, "ENDCATCH", Statements.EndCatch);

const versionsFail = [
  {abap: `ENDCATCH.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDCATCH");
