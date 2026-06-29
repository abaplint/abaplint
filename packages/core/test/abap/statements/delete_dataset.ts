import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DELETE DATASET l_psepath.",
];

statementType(tests, "DELETE DATASET", Statements.DeleteDataset);

const versionsFail = [
  {abap: `DELETE DATASET l_psepath.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DELETE DATASET");
