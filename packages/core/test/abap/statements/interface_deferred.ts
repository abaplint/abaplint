import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "interface if_ixml_node deferred.",
  "INTERFACE zif_foobar DEFERRED PUBLIC.",
];

statementType(tests, "INTERFACE DEFERRED", Statements.InterfaceDeferred);

statementVersionFail([
  {abap: "INTERFACE zif_foo DEFERRED.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "INTERFACE DEFERRED not allowed in KeyUser");