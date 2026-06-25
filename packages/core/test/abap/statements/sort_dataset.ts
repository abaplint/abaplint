import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SORT BY foo bar.",
  "SORT.",
  "SORT AS TEXT.",
  `SORT AS TEXT BY foo-bar foo-bar.`,
];

statementType(tests, "SORT dataset", Statements.SortDataset);

const versionsFail = [
  {abap: `SORT BY foo bar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SORT DATASET");
