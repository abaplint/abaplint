import {statementType, statementExpectFail, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "UPDATE usr02 SET foo = 'bar'.",
  "UPDATE zfoo FROM ls_foo.",
  "UPDATE zfoo.",
  "UPDATE zfoo CLIENT SPECIFIED.",
  "UPDATE zfoo FROM TABLE mt_update.",
  "update zfoo client specified from table lt_table.",
  "UPDATE usr02 SET foo = 'bar' WHERE moo = lv_boo.",
  "UPDATE (c_tabname) SET data_str = iv_data WHERE type = iv_type AND value = iv_value.",
  "UPDATE zfoo CLIENT SPECIFIED SET foo = bar WHERE moo = space.",
  "UPDATE zfoo SET (l_string).",
  "UPDATE zfoo CLIENT SPECIFIED SET foo = bar WHERE moo = SPACE OR boo IS NULL.",
  "UPDATE vekp SET tarag = @lv_tarag, ntvol = @lv_ntvol WHERE venum = @ls_update-venum.",
  "UPDATE table CONNECTION (lv_conn) SET field = value.",
  "UPDATE table CONNECTION my_con SET field = value.",
  "UPDATE table CONNECTION 'R/3*MYCON' SET field = value.",
  "update ztab using client '123' set field = @lv_value.",
  "UPDATE ztab SET column = column + input-menge WHERE val = input-val.",
  "UPDATE ztab SET column = column - 1 WHERE val = input-val.",
  `UPDATE zmoo SET (lt_set).`,
  `UPDATE zmoo SET (lt_set[]).`,
  `UPDATE zmoo CLIENT SPECIFIED SET (lt_set[]).`,
  `UPDATE (gv-bar) CLIENT SPECIFIED SET (lt_set[]).`,
  `UPDATE (gv-bar) CLIENT SPECIFIED SET (lt_set[]) WHERE mandt EQ sy-mandt AND (lt_where[]).`,
  `update /foo/bar from table @tab indicators set structure sdfds.`,
  "UPDATE zfoo FROM @ls_wa.",
  "UPDATE zfoo CLIENT SPECIFIED FROM @ls_wa.",
  "UPDATE zfoo CLIENT SPECIFIED FROM TABLE @lt_wa.",
];

statementType(tests, "UPDATE", Statements.UpdateDatabase);

const arithFail = [
  "UPDATE ztab SET column = column * 2 WHERE val = input-val.",
  "UPDATE ztab SET column = column / 2 WHERE val = input-val.",
];

statementExpectFail(arithFail, "UPDATE SET arithmetic restricted to + and -");

statementVersionOk([
  {abap: `UPDATE zalpha FROM TABLE @utab MAPPING FROM ENTITY.`, rel: Release.v816},
  {abap: `UPDATE (lv_tab) FROM TABLE @utab MAPPING FROM ENTITY.`, rel: Release.v816},
  {abap: `UPDATE zalpha FROM TABLE @utab INDICATORS SET STRUCTURE %zind MAPPING FROM ENTITY.`, rel: Release.v816},
  {abap: `UPDATE (lv_tab) FROM TABLE @utab INDICATORS SET STRUCTURE %zind MAPPING FROM ENTITY.`, rel: Release.v816},
  {abap: `UPDATE zalpha FROM @wa INDICATORS NOT NULL STRUCTURE %zind.`, rel: Release.v816},
], "UPDATE MAPPING FROM ENTITY and INDICATORS", Statements.UpdateDatabase);

statementVersionOk([
  {abap: `UPDATE zalpha SET c1 = '#' WHERE c2 = @lv OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `UPDATE zalpha FROM TABLE @utab MAPPING FROM ENTITY OPTIONS USING CLIENT @lv.`, rel: Release.v816},
  {abap: `UPDATE zalpha FROM TABLE @utab OPTIONS PRIVILEGED ACCESS.`, rel: Release.v816},
], "UPDATE DML OPTIONS", Statements.UpdateDatabase);

const versionsFail = [
  {abap: `UPDATE zfoo CLIENT SPECIFIED.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "UPDATE CLIENT SPECIFIED");