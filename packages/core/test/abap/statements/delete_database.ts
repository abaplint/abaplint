import {statementType, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "DELETE FROM (c_tabname) WHERE type = iv_type AND value = iv_value.",
  "DELETE FROM (iv_table_name) WHERE (iv_where_on_keys).",
  "DELETE FROM vclmf WHERE vclname = lv_vclname.",
  "DELETE FROM ZFOOBAR CLIENT SPECIFIED WHERE MANDT = SY-MANDT.",
  "DELETE zfoo FROM TABLE mt_delete.",
  "DELETE (c_tabname) FROM <wa>.",
  "delete zfoo client specified from table lt_tab.",
  "DELETE FROM zfoo WHERE timestamp < l_timestampl AND state IN (c_value1, c_value2).",
  "DELETE FROM zfoo WHERE bar LIKE 'FOO'.",
  "delete from zfoo where id is not null.",
  "DELETE FROM /foo/bar CONNECTION (con) WHERE id = lv_id.",
  "DELETE FROM /foo/bar CONNECTION my_con WHERE id = lv_id.",
  "DELETE FROM /foo/bar CONNECTION 'R/3*MYCON' WHERE id = lv_id.",
  "delete table connection (lc_db) from table itab.",
  "DELETE FROM ztable USING CLIENT @ls_data-mandt.",
  "DELETE ztable FROM TABLE lt_bar[].",
  `DELETE STXL CLIENT SPECIFIED.`,
  "DELETE zfoo FROM @ls_wa.",
  "DELETE (mv_tab) FROM @ls_wa.",
  "DELETE zfoo CLIENT SPECIFIED FROM @ls_wa.",
  "DELETE zfoo CLIENT SPECIFIED FROM TABLE @lt_wa.",
];

statementType(tests, "DELETE", Statements.DeleteDatabase);

statementVersionOk([
  {abap: `DELETE FROM zalpha WHERE c1 = @lv UP TO 10 ROWS.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha UP TO 10 ROWS.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY c1.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY c1 DESCENDING.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY PRIMARY KEY UP TO 10 ROWS.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY c1 UP TO 100 ROWS OFFSET 5.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY c1, c2 DESCENDING.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv UP TO @lv_n ROWS OFFSET @lv_off.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv OFFSET @lv_off UP TO 10 ROWS.`, rel: Release.v816},
], "DELETE ORDER BY / UP TO / OFFSET", Statements.DeleteDatabase);

statementVersionOk([
  {abap: `DELETE zalpha FROM @wa INDICATORS NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `DELETE zalpha FROM TABLE @itab INDICATORS NULL BITFIELD %zind.`, rel: Release.v816},
], "DELETE INDICATORS", Statements.DeleteDatabase);

statementType([
  "DELETE zalpha FROM @wa MAPPING FROM ENTITY.",
  "DELETE zalpha FROM TABLE @itab MAPPING FROM ENTITY.",
], "DELETE MAPPING FROM ENTITY", Statements.DeleteDatabase);

statementVersionOk([
  {abap: `DELETE FROM zalpha WHERE c1 = @lv OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv ORDER BY c1 UP TO 10 ROWS OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `DELETE FROM zalpha WHERE c1 = @lv OPTIONS PRIVILEGED ACCESS.`, rel: Release.v816},
], "DELETE DML OPTIONS", Statements.DeleteDatabase);

const versionsFail = [
  {abap: `DELETE FROM ZFOOBAR CLIENT SPECIFIED WHERE MANDT = SY-MANDT.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `DELETE FROM zfoo WHERE id = lv_id.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(versionsFail, "DELETE CLIENT SPECIFIED");