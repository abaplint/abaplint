import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `END-OF-SELECTION.`,
];

statementType(tests, "END-OF-SELECTION", Statements.EndOfSelection);

const versionsFail = [
  {abap: `END-OF-SELECTION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "END-OF-SELECTION");
