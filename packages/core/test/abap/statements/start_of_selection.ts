import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "START-OF-SELECTION.",
];

statementType(tests, "START-OF-SELECTION", Statements.StartOfSelection);

const versionsFail = [
  {abap: `START-OF-SELECTION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "START-OF-SELECTION");
