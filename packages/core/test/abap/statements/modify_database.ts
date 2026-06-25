import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY zfoo CLIENT SPECIFIED.",
  "MODIFY (c_tabname) FROM ls_content.",
  "MODIFY zfoo FROM TABLE mt_mat.",
  "MODIFY (lv_table) CONNECTION (lv_db) FROM TABLE it_data.",
  "MODIFY table CONNECTION lv_con FROM TABLE lt_data.",
  "MODIFY /abc/tablea FROM @is_tablea.",
  "MODIFY /abc/tableb FROM TABLE @it_tableb.",
];

statementType(tests, "MODIFY database", Statements.ModifyDatabase);

const versionsFail = [
  {abap: `MODIFY zfoo CLIENT SPECIFIED.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "MODIFY CLIENT SPECIFIED");