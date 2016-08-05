import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET SCREEN 0001.",
];

statementType(tests, "SET SCREEN", Statements.SetScreen);