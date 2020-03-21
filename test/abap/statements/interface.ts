import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "INTERFACE lif_gui_page.",
  "interface ZIF_something public.",
];

statementType(tests, "INTERFACE", Statements.Interface);