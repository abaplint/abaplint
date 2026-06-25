import {statementType, statementVersionFail, statementVersionOk} from "../_utils";
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
  "INSERT zdata CONNECTION 'R/3*MYCON' FROM lv_data.",
  "INSERT zdata CONNECTION 'DEFAULT' FROM lv_data.",
  "insert into ztable client specified connection (l_db) values entry.",
  "INSERT ztable FROM TABLE @lt_data.",
  "INSERT ztotals FROM ( SELECT FROM zheader FIELDS number GROUP BY mandt, number ).",
  "INSERT INTO ztable VALUES @current.",
  "INSERT zdata CONNECTION R/3*MOO FROM lv_data.",
  "INSERT zdata CONNECTION (con).",
  "INSERT zfoo FROM @ls_wa.",
  "INSERT (mv_tabname) FROM @ls_wa.",
  "INSERT zfoo CLIENT SPECIFIED FROM @ls_wa.",
  "INSERT zfoo CLIENT SPECIFIED FROM TABLE @lt_wa.",
];

statementType(tests, "INSERT", Statements.InsertDatabase);

statementVersionOk([
  {abap: `INSERT zalpha FROM @wa INDICATORS NOT NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM TABLE @itab INDICATORS NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM TABLE @itab INDICATORS NULL STRUCTURE %zind ACCEPTING DUPLICATE KEYS.`, rel: Release.v816},
  {abap: `INSERT INTO zalpha VALUES @wa INDICATORS NOT NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa INDICATORS NOT NULL BITFIELD %zind.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa INDICATORS (lv_ind).`, rel: Release.v816},
], "INSERT INDICATORS", Statements.InsertDatabase);

statementVersionOk([
  {abap: `INSERT zalpha FROM @wa OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa OPTIONS USING CLIENT @lv PRIVILEGED ACCESS.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa OPTIONS PRIVILEGED ACCESS.`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa OPTIONS PRIVILEGED ACCESS CONNECTION (lv_con).`, rel: Release.v816},
  {abap: `INSERT zalpha FROM @wa OPTIONS CONNECTION (lv_con).`, rel: Release.v816},
], "INSERT DML OPTIONS", Statements.InsertDatabase);

statementType([
  "INSERT zalpha FROM ( SELECT * FROM zbeta ).",
  "INSERT zalpha FROM ( SELECT * FROM zbeta ) ACCEPTING DUPLICATE KEYS.",
  "INSERT zalpha FROM ( SELECT FROM zbeta FIELDS c1, c2 ).",
  "INSERT zalpha FROM ( SELECT * FROM zbeta WITH PRIVILEGED ACCESS ).",
  "INSERT zalpha FROM ( SELECT * FROM zbeta ) OPTIONS USING CLIENT @lv.",
  "INSERT zalpha FROM ( SELECT FROM zbeta FIELDS c1, c2 WHERE c3 = @lv ) ACCEPTING DUPLICATE KEYS.",
], "INSERT FROM (SELECT) subquery", Statements.InsertDatabase);

statementType([
  "INSERT zalpha FROM @wa MAPPING FROM ENTITY.",
  "INSERT zalpha FROM TABLE @itab MAPPING FROM ENTITY.",
  "INSERT zalpha FROM @wa INDICATORS NULL STRUCTURE %zind MAPPING FROM ENTITY.",
], "INSERT MAPPING FROM ENTITY", Statements.InsertDatabase);

const versionsFail = [
  {abap: `INSERT zfoo CLIENT SPECIFIED.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `INSERT INTO ztable VALUES @ls_row.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(versionsFail, "INSERT CLIENT SPECIFIED");