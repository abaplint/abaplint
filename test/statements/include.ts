import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "INCLUDE zabapgit_gui_pages_userexit IF FOUND.",
  "INCLUDE <OBJECT>.",
  "INCLUDE ZFOO-BAR.", // yes, this is allowed, but not for new programsr
  "INCLUDE zabapgit_gui_router.",
];

statementType(tests, "INCLUDE", Statements.Include);