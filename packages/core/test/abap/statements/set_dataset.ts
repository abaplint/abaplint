import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "SET DATASET l_file POSITION l_pos.",
  "SET DATASET i_filename POSITION END OF FILE.",
];

statementType(tests, "SET DATASET", Statements.SetDataset);

const versionsFail = [
  {abap: `SET DATASET l_file POSITION l_pos.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET DATASET");
