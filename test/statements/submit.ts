import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SUBMIT zdemo WITH rb_down = abap_true WITH rb_show = abap_false AND RETURN.",
];

statementType(tests, "SUBMIT", Statements.Submit);