import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `READ ENTITIES OF zi_foo IN LOCAL MODE
    ENTITY ent
    FIELDS ( field ) WITH CORRESPONDING #( keys )
    RESULT DATA(res).`,
];

statementType(tests, "READ ENTITIES", Statements.ReadEntities);