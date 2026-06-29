import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DEMAND foo = bar FROM CONTEXT ctx.",
  "demand foo = bar from context ctx messages into l_msg.",
];

statementType(tests, "DEMAND", Statements.Demand);

const versionsFail = [
  {abap: `DEMAND foo = bar FROM CONTEXT ctx.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DEMAND");
