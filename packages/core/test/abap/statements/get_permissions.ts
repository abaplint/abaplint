import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `GET PERMISSIONS ONLY GLOBAL AUTHORIZATION ENTITY ent
    REQUEST sourc
    RESULT DATA(result)
    FAILED DATA(failed)
    REPORTED DATA(reported).`,
];

statementType(tests, "GET PERMISSIONS", Statements.GetPermissions);