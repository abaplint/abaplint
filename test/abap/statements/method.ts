import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "METHOD zfoobar.",
  "METHOD foobar by kernel module foobar fail.",
  "METHOD foobar by kernel module foobar ignore.",
  "METHOD if_foo~write BY KERNEL MODULE foobar.",
  "METHOD foobar BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.",
];

statementType(tests, "METHOD", Statements.Method);