import {statementType, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "MODIFY t100 FROM <ls_t100>.",
  "MODIFY zfoo CLIENT SPECIFIED.",
  "MODIFY (c_tabname) FROM ls_content.",
  "MODIFY zfoo FROM TABLE mt_mat.",
  "MODIFY (lv_table) CONNECTION (lv_db) FROM TABLE it_data.",
  "MODIFY table CONNECTION lv_con FROM TABLE lt_data.",
  "MODIFY table CONNECTION 'R/3*MYCON' FROM TABLE lt_data.",
  "MODIFY /abc/tablea FROM @is_tablea.",
  "MODIFY /abc/tableb FROM TABLE @it_tableb.",
  "MODIFY zfoo FROM @ls_wa.",
  "MODIFY (lv_tab) FROM @ls_wa CONNECTION (lv_db).",
  "MODIFY zfoo CLIENT SPECIFIED FROM @ls_wa.",
  "MODIFY zfoo CLIENT SPECIFIED FROM TABLE @lt_wa.",
];

statementType(tests, "MODIFY database", Statements.ModifyDatabase);

statementVersionOk([
  {abap: `MODIFY zalpha FROM @wa INDICATORS NOT NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `MODIFY zalpha FROM TABLE @itab INDICATORS NULL STRUCTURE %zind.`, rel: Release.v816},
  {abap: `MODIFY zalpha FROM TABLE @itab INDICATORS NOT NULL BITFIELD %zind.`, rel: Release.v816},
  {abap: `MODIFY zalpha FROM @wa INDICATORS (lv_ind).`, rel: Release.v816},
], "MODIFY INDICATORS", Statements.ModifyDatabase);

statementVersionOk([
  {abap: `MODIFY zalpha FROM TABLE @itab OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `MODIFY zalpha FROM TABLE @itab OPTIONS PRIVILEGED ACCESS.`, rel: Release.v816},
  {abap: `MODIFY zalpha FROM TABLE @itab OPTIONS USING CLIENT @lv PRIVILEGED ACCESS CONNECTION (lv_con).`, rel: Release.v816},
], "MODIFY DML OPTIONS", Statements.ModifyDatabase);

statementType([
  "MODIFY zalpha FROM ( SELECT * FROM zbeta ).",
  "MODIFY zalpha FROM ( SELECT FROM zbeta FIELDS zcol1, zcol2 ).",
  "MODIFY zalpha FROM ( SELECT * FROM zbeta WHERE zcol1 = @lv ).",
  "MODIFY zalpha FROM ( SELECT * FROM zbeta WITH PRIVILEGED ACCESS ).",
  "MODIFY zalpha FROM ( SELECT * FROM zbeta ) OPTIONS USING CLIENT @lv.",
  "MODIFY zalpha FROM ( SELECT ' 9 ', zcol2, zcol3, zcol4 FROM zalpha WHERE zcol1 = ' 2 ' ).",
  "MODIFY zalpha FROM ( SELECT FROM zalpha FIELDS zcol1, zcol2, zcol3, currency_conversion( amount = zcol_price, source_currency = zcol_curr, target_currency = zcol_curr, exchange_rate_date = @sy-datlo, on_error = @zcl_handler=>c_on_error-fail ) AS zcol_price ).",
], "MODIFY FROM (SELECT) subquery", Statements.ModifyDatabase);

statementType([
  "MODIFY zalpha FROM @wa MAPPING FROM ENTITY.",
  "MODIFY zalpha FROM TABLE @itab MAPPING FROM ENTITY.",
  "MODIFY zalpha FROM TABLE @itab INDICATORS NULL STRUCTURE %zind MAPPING FROM ENTITY.",
], "MODIFY MAPPING FROM ENTITY", Statements.ModifyDatabase);

const versionsFail = [
  {abap: `MODIFY zfoo CLIENT SPECIFIED.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `MODIFY zfoo FROM TABLE lt_data.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(versionsFail, "MODIFY CLIENT SPECIFIED");