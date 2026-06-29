import {statementType, statementVersionOk, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version, Release, LanguageVersion} from "../../../src/version";

const tests = [
  "ASSERT <lv_field> IS ASSIGNED.",
  "ASSERT CONDITION 0 = 1.",
  "ASSERT ID user_mgnt_law CONDITION lv_in_central EQ 'X'.",
  "ASSERT ID __foo__ CONDITION lv_in_central EQ 'X'.",
  "ASSERT FIELDS lx_root->get_text( ) CONDITION 1 = 0.",
  "ASSERT ID bar SUBKEY 'FOO' FIELDS field CONDITION sy-subrc EQ 0.",
  "ASSERT ID /foo/bar CONDITION sy-subrc = 0.",
];

statementType(tests, "ASSERT", Statements.Assert);

const versionsOk = [
  {abap: "ASSERT hex = |11|.", rel: Release.v702},
  {abap: "ASSERT hex = |22|.", rel: Version.OpenABAP},
];

statementVersionOk(versionsOk, "ASSERT", Statements.Assert);

statementVersionFail([
  {abap: "ASSERT CONDITION 1 = 1.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "ASSERT not allowed in KeyUser");