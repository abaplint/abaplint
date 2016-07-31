import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INTERFACE lif_gui_page.",
];

statementType(tests, "INTERFACE", Statements.Interface);