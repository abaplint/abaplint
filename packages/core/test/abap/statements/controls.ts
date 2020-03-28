import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CONTROLS tctrl TYPE TABLEVIEW USING SCREEN 200.",
  "CONTROLS tstrip TYPE TABSTRIP.",
];

statementType(tests, "CONTROLS", Statements.Controls);