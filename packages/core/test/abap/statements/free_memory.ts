import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "free memory id ls_structure.",
  "free memory id 'ALV_SUBMIT_TO_SPOOL'.",
  "free memory.",
];

statementType(tests, "FREE MEMORY", Statements.FreeMemory);

const versionsFail = [
  {abap: `free memory id ls_structure.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "FREE MEMORY");

const keyUserFail = [
  {abap: `free memory id ls_structure.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "FREE MEMORY KeyUser restrictions");
