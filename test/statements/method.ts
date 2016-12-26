import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "METHOD zfoobar.",
  "METHOD foobar by kernel module foobar fail.",
  "METHOD foobar by kernel module foobar ignore.",
];

statementType(tests, "METHOD", Statements.Method);