import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "PROGRAM zfoobar.",
  "PROGRAM zfoobar MESSAGE-ID 01 LINE-SIZE 132.",
  "PROGRAM zfoobar MESSAGE-ID 01 NO STANDARD PAGE HEADING LINE-SIZE 132.",
  "PROGRAM.",
];

statementType(tests, "PROGRAM", Statements.Program);