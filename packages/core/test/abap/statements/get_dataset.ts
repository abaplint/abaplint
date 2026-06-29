import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "get dataset p_filename position lv_size.",
  "GET DATASET me->mv_file ATTRIBUTES ls_attr.",
];

statementType(tests, "GET DATASET", Statements.GetDataset);

const versionsFail = [
  {abap: `get dataset p_filename position lv_size.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET DATASET");
