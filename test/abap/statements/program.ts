import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "PROGRAM zfoobar.",
  "PROGRAM zfoobar MESSAGE-ID 01 LINE-SIZE 132.",
  "PROGRAM zfoobar MESSAGE-ID 01 NO STANDARD PAGE HEADING LINE-SIZE 132.",
  "PROGRAM zbar LINE-COUNT 70.",
  "PROGRAM.",
];

statementType(tests, "PROGRAM", Statements.Program);