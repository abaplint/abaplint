import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENDPROVIDE.",
];

statementType(tests, "ENDPROVIDE", Statements.EndProvide);

const versionsFail = [
  {abap: `ENDPROVIDE.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDPROVIDE");
