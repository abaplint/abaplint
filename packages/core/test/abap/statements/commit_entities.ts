import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src/version";

const tests = [
  `COMMIT ENTITIES
  RESPONSE OF zi_foobar
  FAILED     DATA(failed_commit)
  REPORTED   DATA(reported_commit).`,

  `COMMIT ENTITIES IN SIMULATION MODE.`,

  `COMMIT ENTITIES.`,

  `COMMIT ENTITIES
  RESPONSE OF /foo/bar
  FAILED DATA(failed)
  REPORTED DATA(reported).`,

  `COMMIT ENTITIES RESPONSES FAILED DATA(commit_failed) REPORTED DATA(commit_reported).`,

  `COMMIT ENTITIES RESPONSE OF zfoo
    REPORTED DATA(reported_late)
    FAILED DATA(failed_late).`,
];

statementType(tests, "COMMIT ENTITIES", Statements.CommitEntities);

statementVersionOk([
  {abap: "COMMIT ENTITIES.", ver: Version.OpenABAP},
], "COMMIT ENTITIES", Statements.CommitEntities);
