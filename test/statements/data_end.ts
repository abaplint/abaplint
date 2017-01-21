import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA end of foo.",
  "DATA END OF COMMON PART.",
  "DATA END OF COMMON PART foobar.",
];

statementType(tests, "DATA END", Statements.DataEnd);