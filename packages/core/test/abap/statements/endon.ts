import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ENDON.",
];

statementType(tests, "ENDON", Statements.EndOn);

const versionsFail = [
  {abap: `ENDON.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDON");
