import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "STATICS END OF foo.",
];

statementType(tests, "STATIC END", Statements.StaticEnd);