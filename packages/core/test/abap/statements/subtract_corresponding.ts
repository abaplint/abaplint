import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SUBTRACT-CORRESPONDING foo FROM bar.",
];

statementType(tests, "SUBTRACT-CORRESPONDING", Statements.SubtractCorresponding);

const versionsFail = [
  {abap: `SUBTRACT-CORRESPONDING foo FROM bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SUBTRACT-CORRESPONDING");
