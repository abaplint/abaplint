import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LEAVE TO SCREEN 1001.",
  "LEAVE TO CURRENT TRANSACTION.",
  "LEAVE TO TRANSACTION 'ZHELLO'.",
  "LEAVE PROGRAM.",
];

statementType(tests, "LEAVE", Statements.Leave);