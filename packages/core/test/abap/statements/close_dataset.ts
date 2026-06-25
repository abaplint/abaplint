import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CLOSE DATASET lv_default_file_name.",
  "CLOSE DATASET me->mv_file.",
  "close dataset 'file.xml'.",
];

statementType(tests, "CLOSE", Statements.CloseDataset);

const versionsFail = [
  {abap: `CLOSE DATASET lv_default_file_name.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CLOSE DATASET");
