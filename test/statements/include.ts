import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INCLUDE zabapgit_gui_pages_userexit IF FOUND.",
  "INCLUDE zabapgit_gui_router.",
];

statementType(tests, "INCLUDE", Statements.Include);