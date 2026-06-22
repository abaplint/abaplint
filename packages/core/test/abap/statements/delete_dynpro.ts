import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "DELETE DYNPRO lv_dyn.",
];

statementType(tests, "DELETE DYNPRO", Statements.DeleteDynpro);

const versionsFail = [
  {abap: `DELETE DYNPRO lv_dyn.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "DELETE DYNPRO");
