import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "PACK foo TO bar.",
];

statementType(tests, "PACK", Statements.Pack);

const versionsFail = [
  {abap: `PACK foo TO bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "PACK");
