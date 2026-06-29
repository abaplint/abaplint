import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "INSERT TEXTPOOL is_progdir-name FROM it_tpool LANGUAGE mv_language STATE 'I'.",
  "INSERT textpool l_name FROM it_tpool LANGUAGE sy-langu.",
  "INSERT TEXTPOOL target FROM tab.",
];

statementType(tests, "INSERT TEXTPOOL", Statements.InsertTextpool);

const versionsFail = [
  {abap: `INSERT TEXTPOOL prog FROM lt_tpool LANGUAGE sy-langu.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "INSERT TEXTPOOL");
