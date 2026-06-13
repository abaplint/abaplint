import {statementType, statementVersionOk, statementVersionFail, statementExpectFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  `WITH +cte AS ( SELECT mandt FROM ztable CLIENT SPECIFIED )
    SELECT * FROM +cte WHERE mandt = @sy-mandt INTO TABLE @DATA(result).`,

  `WITH
  +carriers AS ( SELECT FROM scarr
                        FIELDS carrid, carrname )
  SELECT FROM spfli AS s
           INNER JOIN +carriers AS c
             ON s~carrid = c~carrid
         FIELDS c~carrname, s~connid
         WHERE s~carrid = 'UA'
         INTO TABLE @FINAL(itab)
         UP TO 10 ROWS.`,

  `WITH +cte1 AS ( SELECT col1, col2 FROM ztab1 ),
       +cte2 AS ( SELECT t1~col1, t2~col1 FROM +cte1 AS t1 CROSS JOIN +cte1 AS t2 )
    SELECT FROM +cte2 FIELDS col1 INTO TABLE @DATA(lt_r).`,

  `WITH +cte( col1, col2 ) AS ( SELECT id, val FROM ztab )
    SELECT FROM +cte FIELDS col1 INTO TABLE @DATA(lt_r).`,

  `WITH +cte AS ( SELECT FROM ( ztab1 AS t1
                    INNER JOIN ztab2 AS t2 ON t1~id = t2~id )
                    LEFT OUTER JOIN ztab3 AS t3 ON t3~id = t1~id
                  FIELDS t1~id, t2~val
                  WHERE t1~id = @lv_id )
    SELECT FROM +cte FIELDS id INTO TABLE @DATA(lt_r).`,

  `WITH +cte AS ( SELECT FROM ztab1 AS t1
                    INNER JOIN ztab2 AS t2 ON
                    CASE t1~col
                      WHEN @lv_1 THEN 1
                      ELSE 0
                    END = 1
                  FIELDS t1~col, t2~val )
    SELECT FROM +cte FIELDS col INTO TABLE @DATA(lt_r).`,

  `WITH +cte AS ( SELECT FROM ztab
                  FIELDS id,
                    COALESCE( CASE col WHEN @lv_1 THEN col ELSE @lv_2 END, @lv_3 ) AS result )
    SELECT FROM +cte FIELDS id INTO TABLE @DATA(lt_r).`,

  `WITH +cte AS ( SELECT FROM ztab
                  FIELDS id, CAST( col AS INT1 ) AS casted )
    SELECT FROM +cte FIELDS id INTO TABLE @DATA(lt_r).`,

  `WITH +cte1 AS ( SELECT col1 FROM ztab1 ),
       +cte2 AS ( SELECT FROM +cte1 FIELDS col1
                  UNION
                  SELECT FROM +cte1 FIELDS col1 )
    SELECT FROM +cte2 FIELDS col1 INTO TABLE @DATA(lt_r).`,

];

statementType(tests, "WITH", Statements.With);

const privilegedVersions = [
  {abap: `WITH +cte AS ( SELECT mandt FROM ztable WITH PRIVILEGED ACCESS )
    SELECT * FROM +cte INTO TABLE @DATA(result).`, ver: Version.v752},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable WITH PRIVILEGED ACCESS )
    SELECT * FROM +cte WITH PRIVILEGED ACCESS INTO TABLE @DATA(result).`, ver: Version.v752},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, ver: Version.v758},
];

statementVersionOk(privilegedVersions, "WITH privileged access", Statements.With);

const privilegedVersionsFail = [
  {abap: `WITH +cte AS ( SELECT mandt FROM ztable WITH PRIVILEGED ACCESS )
    SELECT * FROM +cte INTO TABLE @DATA(result).`, ver: Version.v751},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, ver: Version.v756},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, ver: Version.v757},
];

statementVersionFail(privilegedVersionsFail, "WITH privileged access");

statementType([
  `SELECT col FROM ztab INTO @wa.`,
], "SELECT parses as SelectLoop not With", Statements.SelectLoop);

statementType([
  `SELECT col FROM ztab INTO TABLE @lt.`,
  `SELECT SINGLE col FROM ztab INTO @wa.`,
], "SELECT parses as Select not With", Statements.Select);

const isWithLoopTests = [
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO TABLE @lt.`,
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO TABLE @DATA(lt_r).`,
];
statementType(isWithLoopTests, "isWithLoop → With (not loop)", Statements.With);

const isWithLoopLoopTests = [
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO @wa.`,
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO TABLE @lt PACKAGE SIZE 10.`,
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO (lv1, lv2).`,
];
statementType(isWithLoopLoopTests, "isWithLoop → WithLoop", Statements.WithLoop);

statementExpectFail([
  `WITH +cte AS ( SELECT col FROM ztab ) SELECT FROM +cte FIELDS col INTO @wa PACKAGE SIZE 10.`,
], "PACKAGE SIZE requires INTO TABLE in WITH");
