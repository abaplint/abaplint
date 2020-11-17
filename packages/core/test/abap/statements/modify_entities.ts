import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `MODIFY ENTITIES OF zi_foobar
  ENTITY ent
  UPDATE SET FIELDS WITH VALUE #( ( foo = 'bar' ) )
  FAILED DATA(failed)
  REPORTED DATA(reported).`,
];

statementType(tests, "MODIFY ENTITIES", Statements.ModifyEntities);