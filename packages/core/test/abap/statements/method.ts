import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src/version";

const tests = [
  "METHOD zfoobar.",
  "METHOD foobar by kernel module foobar fail.",
  "METHOD foobar by kernel module foobar ignore.",
  "METHOD foobar by kernel module foo bar ignore.",
  "METHOD if_foo~write BY KERNEL MODULE foobar.",
  "METHOD foobar BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.",
  "METHOD blah BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.",
  "METHOD blah BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY USING zfoo zbar.",
  "METHOD sdfs BY DATABASE GRAPH WORKSPACE FOR HDB LANGUAGE SQL USING zsdfsd zsdf.",
  "METHOD sdfd BY DATABASE PROCEDURE FOR HDB LANGUAGE GRAPH OPTIONS READ-ONLY USING zcl_bar=>bar.",
  "METHOD /ui2/bar.",
];

statementType(tests, "METHOD", Statements.MethodImplementation);

const keyUserFail = [
  {abap: `METHOD foo BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
  {abap: `METHOD foo BY KERNEL MODULE bar.`, rel: Release.Newest, langVer: LanguageVersion.KeyUser},
];

statementVersionFail(keyUserFail, "METHOD BY DATABASE/KERNEL KeyUser restrictions");