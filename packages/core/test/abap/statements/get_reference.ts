import {statementType, statementVersionFail, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion, Version} from "../../../src/version";

const tests = [
  "GET REFERENCE OF ig_data INTO <ls_stab>-value.",
];

statementType(tests, "GET REFERENCE", Statements.GetReference);

statementVersionFail([
  {abap: "GET REFERENCE OF foo INTO lv_ref.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  {abap: "GET REFERENCE OF foo INTO lv_ref.", rel: Release.Newest, langVer: LanguageVersion.Cloud},
], "GET REFERENCE not allowed in KeyUser and Cloud");

statementVersionOk([
  {abap: "GET REFERENCE OF foo INTO lv_ref.", rel: Release.Newest, langVer: LanguageVersion.Normal},
  {abap: "GET REFERENCE OF foo INTO lv_ref.", rel: Version.v702},
], "GET REFERENCE", Statements.GetReference);