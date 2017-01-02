import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "STATICS BEGIN OF foo.",
  "STATICS BEGIN OF foo OCCURS 0.",
];

statementType(tests, "STATIC BEGIN", Statements.StaticBegin);