import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SYNTAX-CHECK FOR lt_itab MESSAGE lv_mess LINE lv_lin WORD lv_wrd DIRECTORY ENTRY ls_trdir.",
];

statementType(tests, "SYNTAX-CHECK", Statements.SyntaxCheck);