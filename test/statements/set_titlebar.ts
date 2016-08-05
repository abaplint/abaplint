import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET TITLEBAR 'TITLE'.",
];

statementType(tests, "SET TITLEBAR", Statements.SetTitlebar);