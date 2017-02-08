import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DATA begin of foo.",
  "DATA BEGIN OF tab OCCURS 20.",
  "DATA BEGIN OF COMMON PART blah.",
  "DATA BEGIN OF status_/foo/bar.",
  "DATA BEGIN OF /foo/bar.",
];

statementType(tests, "DATA BEGIN", Statements.DataBegin);