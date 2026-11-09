import {statementExpectFail, statementType, statementVersion, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, Version} from "../../../src/version";

const tests = [
  `GET PERMISSIONS ONLY GLOBAL AUTHORIZATION ENTITY ent
    REQUEST sourc
    RESULT DATA(result)
    FAILED DATA(failed)
    REPORTED DATA(reported).`,

  `GET PERMISSIONS ONLY INSTANCE ENTITY ZDMO_C_RAPG_ProjectTP
     FROM VALUE #( ( RapBoUUID = rap_generator_project-RapBoUUID ) )
     REQUEST permission_request
     RESULT DATA(permission_result)
     FAILED DATA(failed_permission_result)
     REPORTED DATA(reported_permission_result).`,

// only_clause variants, ABAPGET_PERMISSIONS_ONLY_CLAUSE
  `GET PERMISSIONS ONLY GLOBAL ENTITY demo_managed_root_3
     REQUEST request
     RESULT FINAL(result1)
     FAILED FINAL(failed1)
     REPORTED FINAL(reported1).`,

  `GET PERMISSIONS ONLY GLOBAL FEATURES ENTITY demo_managed_root_3
     REQUEST request
     RESULT FINAL(result2)
     FAILED FINAL(failed2)
     REPORTED FINAL(reported2).`,

  `GET PERMISSIONS ONLY INSTANCE FEATURES ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 )
                   ( %key-key_field = 2 ) )
     REQUEST request
     RESULT FINAL(result5)
     FAILED FINAL(failed5)
     REPORTED FINAL(reported5).`,

  `GET PERMISSIONS ONLY INSTANCE AUTHORIZATION
     ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result6)
     FAILED FINAL(failed6)
     REPORTED FINAL(reported6).`,

  `GET PERMISSIONS ONLY FEATURES ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result7)
     FAILED FINAL(failed7)
     REPORTED FINAL(reported7).`,

  `GET PERMISSIONS ONLY AUTHORIZATION ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result8)
     FAILED FINAL(failed8)
     REPORTED FINAL(reported8).`,

  `GET PERMISSIONS ONLY (if_abap_behv=>permissions_only-authorization)
     ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result9)
     FAILED FINAL(failed9)
     REPORTED FINAL(reported9).`,

// without only_clause, all aspects
  `GET PERMISSIONS ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result)
     FAILED FINAL(failed)
     REPORTED FINAL(reported).`,

// response_param is optional, ABAPEML_RESPONSE
  `GET PERMISSIONS ONLY GLOBAL ENTITY demo_managed_root_3 REQUEST request RESULT FINAL(result).`,
  `GET PERMISSIONS ONLY GLOBAL ENTITY demo_managed_root_3 REQUEST request RESULT result FAILED failed.`,

// [FORWARDING] PRIVILEGED
  `GET PERMISSIONS PRIVILEGED ONLY INSTANCE ENTITY demo_managed_root_3
     FROM keys REQUEST request RESULT result FAILED failed REPORTED reported.`,
  `GET PERMISSIONS FORWARDING PRIVILEGED ENTITY demo_managed_root_3
     FROM keys REQUEST request RESULT result.`,

// entity given as bdef\\entity, and a namespaced entity
  `GET PERMISSIONS ONLY INSTANCE FEATURES
     ENTITY zdemo_root\\\\root
     FROM VALUE #( ( %key-key_field = 1 ) )
     REQUEST request
     RESULT FINAL(result)
     FAILED FINAL(failed)
     REPORTED FINAL(reported).`,
  `GET PERMISSIONS ONLY GLOBAL ENTITY /dmo/r_root REQUEST request RESULT result.`,

// long form, ABAPGET_PERMISSIONS_LONG
  `GET PERMISSIONS ONLY INSTANCE FEATURES OF demo_managed_root_3
     ENTITY demo_managed_root_3
     FROM VALUE #( ( %key-key_field = 3 )
                   ( %key-key_field = 4 ) )
     REQUEST VALUE #(
       %field-data_field1_root = if_abap_behv=>mk-on
       %field-data_field2_root = if_abap_behv=>mk-on )
     RESULT FINAL(result2)
     ENTITY child
     FROM VALUE #( ( %key-key_field = 3 )
                   ( %key-key_field = 4 ) )
     REQUEST VALUE #(
       %field-data_field1_child = if_abap_behv=>mk-on
       %field-data_field2_child = if_abap_behv=>mk-on )
     RESULT FINAL(result3)
     FAILED FINAL(failed2)
     REPORTED FINAL(reported2).`,

// dynamic form, ABAPGET_PERMISSIONS_DYN
  `GET PERMISSIONS ONLY INSTANCE FEATURES OPERATIONS perm_tab
     FAILED FINAL(failed)
     REPORTED FINAL(reported).`,
];

statementType(tests, "GET PERMISSIONS", Statements.GetPermissions);

statementVersionOk([
  {abap: tests[0], rel: Version.OpenABAP},
], "GET PERMISSIONS", Statements.GetPermissions);

statementVersion([
  {abap: tests[4], rel: Release.v754},
  {abap: tests[tests.length - 1], rel: Release.v754},
], "GET PERMISSIONS", Statements.GetPermissions);

statementExpectFail([
  `GET PERMISSIONS ONLY GLOBAL ENTITY demo_managed_root_3 RESULT result.`,
  `GET PERMISSIONS ONLY LOCAL ENTITY demo_managed_root_3 REQUEST request RESULT result.`,
  `GET PERMISSIONS ONLY GLOBAL INSTANCE ENTITY demo_managed_root_3 REQUEST request RESULT result.`,
], "GET PERMISSIONS");
