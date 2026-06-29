import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  `SET PARAMETER ID 'GR8' FIELD gv_memid_gr8.`,
];

statementType(tests, "SET PARAMETER", Statements.SetParameter);

const versionsFail = [
  {abap: `SET PARAMETER ID 'GR8' FIELD gv_memid_gr8.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "SET PARAMETER");
