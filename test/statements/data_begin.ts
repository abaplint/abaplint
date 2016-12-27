import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA begin of foo.",
  "DATA BEGIN OF tab OCCURS 20.",
  "DATA BEGIN OF COMMON PART blah.",
];

statementType(tests, "DATA BEGIN", Statements.DataBegin);