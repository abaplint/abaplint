import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "GET REFERENCE OF ig_data INTO <ls_stab>-value.",
];

statementType(tests, "GET REFERENCE", Statements.GetReference);

statementVersionFail([
  {abap: "GET REFERENCE OF foo INTO lv_ref.", rel: Release.Newest, langVer: LanguageVersion.KeyUser},
], "GET REFERENCE not allowed in KeyUser");