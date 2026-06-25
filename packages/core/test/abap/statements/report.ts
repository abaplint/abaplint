import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release, LanguageVersion} from "../../../src";

const tests = [
  "REPORT zabapgit LINE-SIZE 100.",
  "REPORT.",
  "REPORT zfoobar MESSAGE-ID zfoo.",
  "REPORT zfoobar MESSAGE-ID 01 NO STANDARD PAGE HEADING LINE-SIZE 190.",
  "REPORT zfoobar NO STANDARD PAGE HEADING LINE-SIZE 1023 LINE-COUNT 600.",
  "REPORT zabapgit.",
  "report zfoobar message-id s#.",
  "REPORT /foo/123.",
  "REPORT /foo/bar.",
  "REPORT zbar NO STANDARD PAGE HEADING LINE-SIZE 255 LINE-COUNT 60(03) MESSAGE-ID z3.",
  "REPORT zsomething NO STANDARD PAGE HEADING LINE-SIZE 132 LINE-COUNT 65(3).",
  "REPORT zbar USING DATABASE ldb MESSAGE-ID aa.",
  "REPORT zxxsdfsd//sdfs.",
  "REPORT zxxs/dfsd//sdf/s.",
  "REPORT foo-bar.",
  `REPORT zmoo MESSAGE-ID W+.`,
  `REPORT zmoo LINE-SIZE 200 NO STANDARD PAGE HEADING MESSAGE-ID Y<.`,
  `report ztips&tricks.`,
  `REPORT AQSDFSD======= LINE-SIZE 253 NO STANDARD PAGE HEADING LINE-COUNT 000(001).`,
];

statementType(tests, "REPORT", Statements.Report);

const versionsFail = [
  {abap: `REPORT zabapgit LINE-SIZE 100.`, rel: Release.Newest, langVer: LanguageVersion.Cloud},
];

statementVersionFail(versionsFail, "REPORT");
