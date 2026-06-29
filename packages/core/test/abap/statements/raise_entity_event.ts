import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "RAISE ENTITY EVENT /foo/bar~send FROM lt_events.",
];

statementType(tests, "RAISE EVENT", Statements.RaiseEntityEvent);

const keyUserFail = [
  {abap: `RAISE ENTITY EVENT foo~bar FROM lt_events.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "RAISE ENTITY EVENT KeyUser restrictions");