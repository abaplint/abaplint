import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PROGRAM zfoobar.",
  "PROGRAM zfoobar MESSAGE-ID 01 LINE-SIZE 132.",
];

statementType(tests, "PROGRAM", Statements.Program);