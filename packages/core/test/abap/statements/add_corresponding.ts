import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "ADD-CORRESPONDING foo TO bar.",
];

statementType(tests, "ADD-CORRESPONDING", Statements.AddCorresponding);

const versionsFail = [
  {abap: `ADD-CORRESPONDING foo TO bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ADD-CORRESPONDING");
