import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "call dialog 'ZDIALOG' exporting foo from bar.",
  "CALL DIALOG 'ZDIALOG' EXPORTING field stru-field tcode moo FROM boo.",
];

statementType(tests, "CALL DIALOG", Statements.CallDialog);