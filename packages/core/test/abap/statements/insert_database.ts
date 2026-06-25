import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "INSERT tactz FROM TABLE lt_tactz.",
  "INSERT zfoo.",
  "INSERT INTO zuser VALUES ls_user.",
  "INSERT zfoo CLIENT SPECIFIED.",
  "INSERT INTO ztable client specified VALUES ls_values.",
  "insert zdata from table lt_table accepting duplicate keys.",
  "INSERT (c_tabname) FROM ls_foobar.",
  "INSERT (c_tabname) CLIENT SPECIFIED FROM TABLE lt_table.",
  "INSERT (mv_tabname) CONNECTION default FROM ig_row.",
  "INSERT (mv_tabname) CONNECTION (mv_connection_key) FROM ig_row.",
  "insert into ztable client specified connection (l_db) values entry.",
  "INSERT ztable FROM TABLE @lt_data.",
  "INSERT ztotals FROM ( SELECT FROM zheader FIELDS number GROUP BY mandt, number ).",
  "INSERT INTO ztable VALUES @current.",
  "INSERT zdata CONNECTION R/3*MOO FROM lv_data.",
  "INSERT zdata CONNECTION (con).",
];

statementType(tests, "INSERT", Statements.InsertDatabase);

const versionsFail = [
  {abap: `INSERT zfoo CLIENT SPECIFIED.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `INSERT INTO ztable VALUES @ls_row.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(versionsFail, "INSERT CLIENT SPECIFIED");