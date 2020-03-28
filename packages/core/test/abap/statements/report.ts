import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

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
];

statementType(tests, "REPORT", Statements.Report);