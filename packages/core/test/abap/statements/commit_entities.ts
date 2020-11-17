import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `COMMIT ENTITIES
  RESPONSE OF zi_foobar
  FAILED     DATA(failed_commit)
  REPORTED   DATA(reported_commit).`,
];

statementType(tests, "COMMIT ENTITIES", Statements.CommitEntities);