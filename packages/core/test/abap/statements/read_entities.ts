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

  `READ ENTITIES OF /foo/bar
    ENTITY ent
    ALL FIELDS WITH VALUE #( ( sdf = '123' ) )
    RESULT DATA(lt_tab)
    FAILED DATA(lt_failed)
    REPORTED DATA(lt_reported).`,

  `READ ENTITIES OF ZDMO_R_RAPG_ProjectTP
    IN LOCAL MODE ENTITY Node BY \\_Project
    FROM CORRESPONDING #( rapbo_nodes )
    LINK DATA(rapbo_nodes_links).`,

  `READ ENTITIES OF /DMO/FSA_R_RootTP
      ENTITY Root
        FIELDS ( StringProperty ) WITH CORRESPONDING #( keys )
        RESULT DATA(roots)
      ENTITY Root BY \\_Child
        ALL FIELDS WITH CORRESPONDING #( keys )
        RESULT DATA(children)
      FAILED DATA(read_failed).`,
];

statementType(tests, "READ ENTITIES", Statements.ReadEntities);