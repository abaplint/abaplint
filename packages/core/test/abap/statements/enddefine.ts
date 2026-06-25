import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `END-OF-DEFINITION.`,
];

statementType(tests, "ENDDEFINE", Statements.EndOfDefinition);

const versionsFail = [
  {abap: `END-OF-DEFINITION.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "ENDDEFINE");
