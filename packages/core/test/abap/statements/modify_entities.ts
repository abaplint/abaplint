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

  `MODIFY ENTITIES OF sdf
  ENTITY ent
    CREATE AUTO FILL CID FIELDS ( field1 field2 ) WITH create
  MAPPED DATA(mapped)
  REPORTED DATA(reported)
  FAILED DATA(failed).`,

  `MODIFY ENTITIES OF bar
    ENTITY ent
    UPDATE FIELDS ( field )
    WITH sdfsdf
    FAILED DATA(failed)
    REPORTED DATA(reported).`,

  `MODIFY ENTITIES OF sdf
    ENTITY ent DELETE FROM bar
    FAILED DATA(failed)
    REPORTED DATA(reported).`,

  `MODIFY ENTITIES OF sdf IN LOCAL MODE
    ENTITY ent
    EXECUTE blah FROM val
    RESULT DATA(result)
    FAILED DATA(failed).`,
];

statementType(tests, "MODIFY ENTITIES", Statements.ModifyEntities);