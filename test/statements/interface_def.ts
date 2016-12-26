import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INTERFACES lif_gui_page ABSTRACT METHODS render.",
  "INTERFACES zif_foo PARTIALLY IMPLEMENTED.",
  "interfaces zif_foo all methods abstract.",
  "interfaces zif_foo data values HEIGHT = 100 WIDTH = 100.",
];

statementType(tests, "INTERFACES", Statements.InterfaceDef);