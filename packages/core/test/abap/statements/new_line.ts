import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "NEW-LINE.",
  "NEW-LINE SCROLLING.",
  "NEW-LINE NO-SCROLLING.",
];

statementType(tests, "NEW-LINE", Statements.NewLine);

const versionsFail = [
  {abap: `NEW-LINE.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "NEW-LINE");
