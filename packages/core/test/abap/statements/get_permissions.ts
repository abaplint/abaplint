import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

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
];

statementType(tests, "GET PERMISSIONS", Statements.GetPermissions);

statementVersionOk([
  {abap: tests[0], ver: Version.OpenABAP},
], "GET PERMISSIONS", Statements.GetPermissions);
