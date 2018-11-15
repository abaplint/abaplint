import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "INTERFACE lif_gui_page.",
  "interface ZIF_something public.",
];

statementType(tests, "INTERFACE", Statements.Interface);