import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "TRANSFER lv_file  TO lv_default_file_name.",
  "TRANSFER <rawdata> TO p_back LENGTH bytes.",
  "TRANSFER l_data TO 'foobar.txt'.",
  "TRANSFER iv_text TO iv_path NO END OF LINE.",
  `TRANSFER foo TO bar.`,
];

statementType(tests, "TRANSFER", Statements.Transfer);

const versionsFail = [
  {abap: `TRANSFER lv_file  TO lv_default_file_name.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "TRANSFER");
