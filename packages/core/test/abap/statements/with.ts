import {statementType} from "../_utils";
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

];

statementType(tests, "WITH", Statements.With);