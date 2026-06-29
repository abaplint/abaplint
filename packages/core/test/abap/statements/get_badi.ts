import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "GET BADI lo_foobar.",
  "GET BADI lo_foobar FILTERS foo = bar.",
  "GET BADI l_badi CONTEXT me.",
  "GET BADI r_badi TYPE (iv_name).",
  "GET BADI lo_badi TYPE (iv_badi_name) FILTERS foo = bar.",
];

statementType(tests, "GET BADI", Statements.GetBadi);

const versionsFail = [
  {abap: `GET BADI lo_foobar.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "GET BADI");

const keyUserFail = [
  {abap: `GET BADI lo_foobar.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "GET BADI KeyUser restrictions");
