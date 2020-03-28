import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "METHOD zfoobar.",
  "METHOD foobar by kernel module foobar fail.",
  "METHOD foobar by kernel module foobar ignore.",
  "METHOD foobar by kernel module foo bar ignore.",
  "METHOD if_foo~write BY KERNEL MODULE foobar.",
  "METHOD foobar BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT.",
  "METHOD blah BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY.",
  "METHOD blah BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT OPTIONS READ-ONLY USING zfoo zbar.",
];

statementType(tests, "METHOD", Statements.Method);