import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA end of foo.",
  "DATA END OF COMMON PART.",
  "DATA END OF COMMON PART foobar.",
  "DATA END OF status_/foo/bar.",
  "DATA END OF /foo/bar.",
];

statementType(tests, "DATA END", Statements.DataEnd);