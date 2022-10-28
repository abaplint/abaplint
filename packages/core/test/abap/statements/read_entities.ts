import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `READ ENTITIES OF zi_foo IN LOCAL MODE
    ENTITY ent
    FIELDS ( field ) WITH CORRESPONDING #( keys )
    RESULT DATA(res).`,

  `READ ENTITIES OF sdf IN LOCAL MODE
    ENTITY reqe
      FIELDS ( foo bar )
      WITH CORRESPONDING #( keys )
    RESULT DATA(res)
    FAILED DATA(failed)
    REPORTED DATA(reported).`,

  `READ ENTITIES OF sdf IN LOCAL MODE
      ENTITY ent BY \\_acc
        FIELDS ( field )
        WITH CORRESPONDING #( keys )
    RESULT DATA(tr)
    LINK DATA(link)
    FAILED DATA(failed)
    REPORTED DATA(reported).`,

  `READ ENTITIES OF /foo/bar IN LOCAL MODE
     ENTITY ent
     FIELDS ( aedat )
     WITH CORRESPONDING #( keys )
     RESULT DATA(lt_dat)
     FAILED DATA(lt_failed).`,

  `READ ENTITIES OF /foo/bar IN LOCAL MODE
    ENTITY ent
    FROM VALUE #(
      FOR <key> IN keys (
        %key = <key>
        control = VALUE #( sdf = if_abap_behv=>mk-on ) ) )
      RESULT DATA(lt_tab).`,

  `READ ENTITIES OF /foo/bar
    ENTITY ent
    FIELDS ( field )
    WITH CORRESPONDING #( tab )
    RESULT DATA(lt_dat)
    FAILED DATA(lt_failed).`,
];

statementType(tests, "READ ENTITIES", Statements.ReadEntities);