import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "NODES blah.",
];

statementType(tests, "NODES", Statements.Nodes);

const versionsFail = [
  {abap: `NODES blah.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "NODES");
