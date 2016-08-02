import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SELECTION-SCREEN BEGIN OF BLOCK b1 WITH FRAME TITLE TEXT-001.",
  "SELECTION-SCREEN BEGIN OF SCREEN 1001.",
  "SELECTION-SCREEN BEGIN OF LINE.",
  "SELECTION-SCREEN END OF LINE.",
  "SELECTION-SCREEN BEGIN OF BLOCK blo WITH FRAME.",
  "SELECTION-SCREEN END OF BLOCK b1.",
  "SELECTION-SCREEN COMMENT (60) cmt_dump FOR FIELD cb_dump.",
];

statementType(tests, "SELECTION-SCREEN", Statements.SelectionScreen);