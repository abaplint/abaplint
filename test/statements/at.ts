import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT FIRST.",
  "AT NEW field.",
  "AT END OF field.",
  "AT LAST.",
  "AT NEW (ls_foo-field).",
  "AT END OF (ls_foo-field).",
];

statementType(tests, "AT", Statements.At);