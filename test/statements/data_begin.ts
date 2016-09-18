import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA begin of foo.",
];

statementType(tests, "DATA BEGIN", Statements.DataBegin);