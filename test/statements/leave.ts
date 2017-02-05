import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LEAVE TO SCREEN 1001.",
  "LEAVE.",
  "LEAVE TO SCREEN '1234'.",
  "LEAVE SCREEN.",
  "LEAVE LIST-PROCESSING.",
  "LEAVE TO CURRENT TRANSACTION.",
  "LEAVE TO TRANSACTION 'ZHELLO'.",
  "LEAVE TO LIST-PROCESSING AND RETURN TO SCREEN 0.",
  "LEAVE TO LIST-PROCESSING.",
  "LEAVE PROGRAM.",
  "LEAVE TO TRANSACTION lv_tcode AND SKIP FIRST SCREEN.",
  "leave list-processing and return to screen 0.",
];

statementType(tests, "LEAVE", Statements.Leave);