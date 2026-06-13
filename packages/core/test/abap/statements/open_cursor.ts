/* eslint-disable max-len */
import {statementType, statementVersion, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  "OPEN CURSOR WITH HOLD l_db_cursor FOR SELECT mandt objct FROM usr12 WHERE mandt = lv_mandt.",
  "open cursor l_cursor for select * from ztab.",
  "open cursor l_cursor for select * from ztab connection foo.",
  "OPEN CURSOR WITH HOLD mv_cursor FOR SELECT (iv_select) FROM (iv_from) WHERE (iv_where) GROUP BY (iv_group) ORDER BY (iv_order).",
  "OPEN CURSOR WITH HOLD lv_cursor FOR SELECT (lt_fields) FROM (lv_tab) WHERE (lt_where) %_HINTS DB6 'USE_FOO'.",
  `OPEN CURSOR WITH HOLD lv_cur
    FOR SELECT (name) FROM (tabname)
    CLIENT SPECIFIED
    %_HINTS ORACLE var
            INFORMIX var
            MSSQLNT 'TABLE &TABLE& INDEX=0'.`,
];

statementType(tests, "OPEN CURSOR", Statements.OpenCursor);

const privilegedVersions = [
  {abap: `OPEN CURSOR lv_cursor FOR SELECT * FROM ztab WITH PRIVILEGED ACCESS.`, ver: Version.v752},
  {abap: `OPEN CURSOR WITH HOLD lv_cursor FOR SELECT * FROM ztab WITH PRIVILEGED ACCESS WHERE id = lv_id.`, ver: Version.v752},
];

statementVersion(privilegedVersions, "OPEN CURSOR privileged access", Statements.OpenCursor);

const privilegedVersionsFail = [
  {abap: `OPEN CURSOR lv_cursor FOR SELECT * FROM ztab WITH PRIVILEGED ACCESS.`, ver: Version.v751},
];

statementVersionFail(privilegedVersionsFail, "OPEN CURSOR privileged access");

const optionsVersions = [
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM veri_VER56133_cl ORDER BY PRIMARY KEY OPTIONS USING ALL CLIENTS.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS PRIVILEGED ACCESS.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS PRIVILEGED ACCESS CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS PRIVILEGED ACCESS BYPASSING BUFFER CONNECTION foo.`, ver: Version.v758},
];

statementVersion(optionsVersions, "OPEN CURSOR OPTIONS clause", Statements.OpenCursor);

const optionsVersionsFail = [
  {abap: `OPEN CURSOR @DATA(cursor) FOR SELECT * FROM ztab OPTIONS USING ALL CLIENTS.`, ver: Version.v757},
];

statementVersionFail(optionsVersionsFail, "OPEN CURSOR OPTIONS clause");

const unionTests = [
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab USING CLIENT @mandt UNION ALL SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') UNION ALL SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') USING CLIENT @mandt UNION ALL SELECT f1 FROM ('ztab').`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab USING CLIENT @mandt UNION ALL SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ztab USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab CLIENT SPECIFIED WHERE k = @sy-mandt UNION ALL SELECT f1 FROM ('ztab') USING CLIENT @mandt.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ('ztab') USING CLIENT @mandt UNION ALL SELECT f1 FROM ('ztab') CLIENT SPECIFIED WHERE k = @curr.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab UNION SELECT f1 FROM ztab.`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ( SELECT f1 FROM ztab UNION ALL SELECT f1 FROM ztab ).`,
  `OPEN CURSOR @cu FOR SELECT f1 FROM ztab UNION ALL ( SELECT f1 FROM ztab UNION SELECT f1 FROM ztab ).`,
];

statementType(unionTests, "OPEN CURSOR UNION combinations", Statements.OpenCursor);