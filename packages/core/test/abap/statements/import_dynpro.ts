import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "IMPORT DYNPRO ls_h lt_f lt_e lt_m ID ls_dynp_id.",
];

statementType(tests, "IMPORT DYNPRO", Statements.ImportDynpro);

const versionsFail = [
  {abap: `IMPORT DYNPRO ls_h lt_f lt_e lt_m ID ls_dynp_id.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "IMPORT DYNPRO");
