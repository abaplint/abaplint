import {statementType, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CALL TRANSACTION 'FOO'.",
  "CALL TRANSACTION 'FOO' AND SKIP FIRST SCREEN.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK AND SKIP FIRST SCREEN.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK USING lt_bdcdata MODE lv_mode.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK USING bdcdata OPTIONS FROM opt.",
  "CALL TRANSACTION 'FOO' USING BDCDATA MODE 'E' UPDATE 'A'.",
  "CALL TRANSACTION 'FOO' USING BDCDATA MODE lv_mode MESSAGES INTO lt_messages.",
  "CALL TRANSACTION 'FOO' WITHOUT AUTHORITY-CHECK USING lt_data OPTIONS FROM ls_opt MESSAGES INTO lt_mess.",
  "CALL TRANSACTION 'FOO' USING mt_bdcdata UPDATE 'S' MODE 'E'.",
  "CALL TRANSACTION 'ZA01' USING gt_bdcdata MESSAGES INTO lt_msg MODE l_mode UPDATE 'S'.",
  "CALL TRANSACTION 'ZA02' USING gt_bdcdata MESSAGES INTO lt_msg OPTIONS FROM l_options.",
];

statementType(tests, "CALL TRANSACTION", Statements.CallTransaction);

const versionsOk = [
  {abap: `CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK.`, rel: Release.v740sp02},
  {abap: `CALL TRANSACTION 'FOO' WITHOUT AUTHORITY-CHECK.`, rel: Release.v740sp02},
  {abap: `CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK.`, rel: Release["open-abap"]},
  {abap: `CALL TRANSACTION 'FOO' WITHOUT AUTHORITY-CHECK.`, rel: Release["open-abap"]},
];

statementVersionOk(versionsOk, "CALL TRANSACTION", Statements.CallTransaction);

const versionsFail = [
  {abap: `CALL TRANSACTION 'FOO'.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK.`, rel: Release.v702},
  {abap: `CALL TRANSACTION 'FOO' WITHOUT AUTHORITY-CHECK.`, rel: Release.v702},
];

statementVersionFail(versionsFail, "CALL TRANSACTION");
