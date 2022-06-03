import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `SET LOCKS OF sdf
    ENTITY ent
    FROM source
    FAILED DATA(failed)
    REPORTED DATA(reported).`,
];

statementType(tests, "SET LOCKS", Statements.SetLocks);