import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CONTROLS tctrl TYPE TABLEVIEW USING SCREEN 200.",
  "CONTROLS tstrip TYPE TABSTRIP.",
];

statementType(tests, "CONTROLS", Statements.Controls);