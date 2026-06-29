import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CONTEXTS ctx.",
];

statementType(tests, "CONTEXTS", Statements.Contexts);

const versionsFail = [
  {abap: `CONTEXTS ctx.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CONTEXTS");
