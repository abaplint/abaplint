import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET RUN TIME CLOCK RESOLUTION LOW.",
  "SET RUN TIME CLOCK RESOLUTION HIGH.",
  "SET RUN TIME ANALYZER ON.",
  "SET RUN TIME ANALYZER OFF.",
];

statementType(tests, "SET RUN TIME", Statements.SetRunTime);

const versionsFail = [
  {abap: `SET RUN TIME CLOCK RESOLUTION LOW.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET RUN TIME");
