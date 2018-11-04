import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "AT FIRST.",
  "AT NEW field.",
  "AT END OF field.",
  "AT LAST.",
  "AT NEW (ls_foo-field).",
  "AT END OF (ls_foo-field).",
  "AT NEW <foo>.",
  "AT END OF <bar>.",
  "AT group.",
  "AT END OF field(10).",
];

statementType(tests, "AT", Statements.At);