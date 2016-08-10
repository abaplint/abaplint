import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "REPORT zabapgit LINE-SIZE 100.",
  "REPORT.",
  "REPORT zfoobar MESSAGE-ID zfoo.",
  "REPORT zfoobar NO STANDARD PAGE HEADING LINE-SIZE 1023 LINE-COUNT 600.",
  "REPORT zabapgit.",
];

statementType(tests, "REPORT", Statements.Report);