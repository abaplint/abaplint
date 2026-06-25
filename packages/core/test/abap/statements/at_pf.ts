import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  `AT PF1.`,
  `AT PF01.`,
  `AT PF24.`,
];

statementType(tests, "AT PF", Statements.AtPF);

const versionsOkAsAt = [
  {abap: `AT PF1.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionOk(versionsOkAsAt, "AT PF falls back to At under Cloud", Statements.At);
