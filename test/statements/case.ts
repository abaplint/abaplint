import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CASE foobar.",
  "CASE TYPE OF typedescr.",
];

statementType(tests, "CASE", Statements.Case);