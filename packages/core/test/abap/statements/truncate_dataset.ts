import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "truncate dataset i_filename at current position.",
];

statementType(tests, "TRUNCATE DATASET", Statements.TruncateDataset);

const versionsFail = [
  {abap: `truncate dataset i_filename at current position.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TRUNCATE DATASET");
