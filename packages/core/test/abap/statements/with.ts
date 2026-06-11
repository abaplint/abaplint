import {statementType, statementVersionOk, statementVersionFail} from "../_utils";
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
