import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "METHOD zfoobar.",
  "METHOD foobar by kernel module foobar fail.",
  "METHOD foobar by kernel module foobar ignore.",
  "METHOD if_foo~write BY KERNEL MODULE foobar.",
];

statementType(tests, "METHOD", Statements.Method);