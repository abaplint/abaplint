import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INTERFACE lif_gui_page.",
  "interface ZIF_FOO load.",
  "interface ZIF_something public.",
  "interface if_ixml_node deferred.",
];

statementType(tests, "INTERFACE", Statements.Interface);