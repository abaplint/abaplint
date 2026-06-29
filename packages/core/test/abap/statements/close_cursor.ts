import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "CLOSE CURSOR cur.",
  "CLOSE CURSOR me->cursor.",
  "CLOSE CURSOR @lv_cursor.",
];

statementType(tests, "CLOSE CURSOR", Statements.CloseCursor);

const versionsFail = [
  {abap: `CLOSE CURSOR cur.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "CLOSE CURSOR");
