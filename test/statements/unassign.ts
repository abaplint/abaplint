import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "UNASSIGN <blah>.",
  "UNASSIGN <%%foo>.",
];

statementType(tests, "UNASSIGN", Statements.Unassign);