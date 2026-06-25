import {Release, LanguageVersion} from "../../../src/version";
import {statementType, statementVersionOk, statementVersionFail, statementExpectFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";


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
    SELECT * FROM +cte INTO TABLE @DATA(result).`, rel: Release.v752},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable WITH PRIVILEGED ACCESS )
    SELECT * FROM +cte WITH PRIVILEGED ACCESS INTO TABLE @DATA(result).`, rel: Release.v752},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, rel: Release.v758},
];

statementVersionOk(privilegedVersions, "WITH privileged access", Statements.With);

const privilegedVersionsFail = [
  {abap: `WITH +cte AS ( SELECT mandt FROM ztable WITH PRIVILEGED ACCESS )
    SELECT * FROM +cte INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, rel: Release.v756},

  {abap: `WITH +cte AS ( SELECT mandt FROM ztable )
    SELECT * FROM +cte INTO TABLE @DATA(result) PRIVILEGED ACCESS.`, rel: Release.v757},
];

statementVersionFail(privilegedVersionsFail, "WITH privileged access");

statementVersionOk([
  {abap: `WITH +p AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc AS llt )
    SELECT col1 FROM +p AS p WHERE col2 = 'AB' AND col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc1, \\zassoc2 )
    SELECT col1 FROM +a WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc AS x ),
         +b AS ( SELECT * FROM +a ) WITH ASSOCIATIONS ( \\x AS y )
    SELECT col1 FROM +b WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\x ),
         +b AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\y ),
         +c AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\z )
    SELECT * FROM +a INTO TABLE @DATA(r).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc AS x ),
         +b AS ( SELECT * FROM +a ) WITH ASSOCIATIONS ( \\x AS y ),
         +c AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\zassoc1, \\zassoc2 )
    SELECT col1 FROM +a WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT FROM zcds( p_langu = @sy-langu ) AS t FIELDS * ) WITH ASSOCIATIONS ( \\zassoc AS x ),
         +b AS ( SELECT FROM +a FIELDS * ) WITH ASSOCIATIONS ( \\x AS y ),
         +c AS ( SELECT FROM ztab AS t FIELDS * ) WITH ASSOCIATIONS ( \\zassoc1, \\zassoc2 )
    SELECT col1 FROM +b WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT col1 AS r, col2 AS a FROM ztab WHERE col3 = @sy-repid ),
          +b AS ( SELECT FROM ztab2 FIELDS col1, col2, \\zassoc-col1 AS v1, \\zassoc-col2 AS v2 )
               WITH ASSOCIATIONS ( \\zassoc\\zassoc2[ WHERE col1 LIKE '%e%' ] AS foo REDIRECTED TO +a VIA ztab )
    SELECT FROM +b AS result FIELDS \\foo[ WHERE col1 < 6 ]-r
      WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +cte AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS ( \\_spfli )
    SELECT * FROM +cte\\_spfli AS spfli INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT col1, col2 FROM ztab ) WITH ASSOCIATIONS ( \\zassoc ),
          +b AS ( SELECT FROM zcds( p_langu = @sy-langu ) FIELDS * ) WITH ASSOCIATIONS ( \\zassoc2 AS t )
    SELECT col1 FROM +a WHERE col3 = @sy-repid INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab ) WITH ASSOCIATIONS (lv_assoc)
    SELECT * FROM +a INTO TABLE @DATA(result).`, rel: Release.v751},
], "WITH ASSOCIATIONS", Statements.With);

statementVersionOk([
  {abap: `WITH +a AS ( SELECT col1, col2 FROM ztab WHERE col3 = @sy-repid ) WITH HIERARCHY t1
    SELECT * FROM +a INTO TABLE @DATA(result).`, rel: Release.v751},

  {abap: `WITH +a AS ( SELECT * FROM ztab AS t1 WHERE col3 = @sy-repid ) WITH HIERARCHY t1 WITH ASSOCIATIONS ( \\zassoc )
    SELECT * FROM +a INTO TABLE @DATA(result).`, rel: Release.v751},
], "WITH HIERARCHY", Statements.With);

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

const clientSpecifiedFail = [
  {abap: `WITH +cte AS ( SELECT mandt FROM ztable CLIENT SPECIFIED )
    SELECT * FROM +cte WHERE mandt = @sy-mandt INTO TABLE @DATA(result).`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
  {abap: `WITH +cte AS ( SELECT col FROM ztab )
    SELECT FROM +cte FIELDS col INTO TABLE @DATA(lt_r).`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(clientSpecifiedFail, "WITH CLIENT SPECIFIED");

statementType([
  `WITH +cte AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( JOIN ztarget AS xx ON 1 = 1 )
   SELECT k FROM +cte INTO TABLE @lt.`,
  `WITH +cte AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( JOIN MANY TO ONE ztarget AS xx ON 1 = 1 )
   SELECT k FROM +cte INTO TABLE @lt.`,
  `WITH +cte AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( JOIN ONE TO MANY ztarget AS xx ON +cte~k = xx~k )
   SELECT k FROM +cte INTO TABLE @lt.`,
  `WITH +cte AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( JOIN #my_tag MANY TO ONE ztarget AS xx ON +cte~k = xx~k )
   SELECT k FROM +cte INTO TABLE @lt.`,
  `WITH +cte AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( JOIN EXACT ONE TO ONE ztarget AS xx ON +cte~k = xx~k )
   SELECT k FROM +cte INTO TABLE @lt.`,
], "WITH ASSOCIATIONS defining new association (JOIN)", Statements.With);

statementType([
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1 )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1 AS x )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1[ #my_tag ] AS x )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1[ #my_tag LEFT OUTER ] AS x )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1[ #my_tag ONE TO ONE ] AS x )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
  `WITH +cte1 AS ( SELECT * FROM ztab )
   WITH ASSOCIATIONS ( +cte1~\\zassoc1[ #my_tag WHERE zcol = @lv ] AS x )
   SELECT k FROM +cte1 INTO TABLE @lt.`,
], "WITH ASSOCIATIONS qualified +cte~\\assoc path", Statements.With);
