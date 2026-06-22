import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "EXPORT DYNPRO H F E M ID KEY.",
];

statementType(tests, "EXPORT DYNPRO", Statements.ExportDynpro);

const versionsFail = [
  {abap: `EXPORT DYNPRO H F E M ID KEY.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "EXPORT DYNPRO");
