import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `MODIFY ENTITIES OF zi_foobar
  ENTITY ent
  UPDATE SET FIELDS WITH VALUE #( ( foo = 'bar' ) )
  FAILED DATA(failed)
  REPORTED DATA(reported).`,

  `MODIFY ENTITIES OF foo
  ENTITY bar
  CREATE FIELDS ( fielda fieldb ) WITH create
  FAILED DATA(failed_modify)
  REPORTED DATA(reported_modify).`,
];

statementType(tests, "MODIFY ENTITIES", Statements.ModifyEntities);