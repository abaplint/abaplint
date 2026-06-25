import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET PARAMETER ID 'GR8' FIELD gv_memid_gr8.",
  "GET PARAMETER ID 'ZID' FIELD ls_foo-bar.",
];

statementType(tests, "GET PARAMETER", Statements.GetParameter);

const versionsFail = [
  {abap: `GET PARAMETER ID 'GR8' FIELD gv_memid_gr8.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET PARAMETER");
