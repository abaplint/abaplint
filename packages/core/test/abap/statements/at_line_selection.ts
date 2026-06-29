import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "AT LINE-SELECTION.",
];

statementType(tests, "AT LINE-SELECTION", Statements.AtLineSelection);

const versionsFail = [
  {abap: `AT LINE-SELECTION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "AT LINE-SELECTION");
