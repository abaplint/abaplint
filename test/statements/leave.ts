import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
    "LEAVE TO SCREEN 1001.",
  ];

statementType(tests, "LEAVE", Statements.Leave);