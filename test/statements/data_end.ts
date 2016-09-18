import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA end of foo.",
];

statementType(tests, "DATA END", Statements.DataEnd);