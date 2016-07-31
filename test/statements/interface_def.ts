import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INTERFACES lif_gui_page ABSTRACT METHODS render.",
];

statementType(tests, "INTERFACES", Statements.InterfaceDef);