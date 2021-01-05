import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `WITH +cte AS ( SELECT mandt FROM ztable CLIENT SPECIFIED )
    SELECT * FROM +cte WHERE mandt = @sy-mandt INTO TABLE @DATA(result).`,
];

statementType(tests, "WITH", Statements.With);