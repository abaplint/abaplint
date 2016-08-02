import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT FIRST.",
  "AT NEW field.",
  "AT END OF field.",
  "AT LAST.",
];

statementType(tests, "AT", Statements.At);