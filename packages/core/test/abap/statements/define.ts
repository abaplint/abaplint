import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DEFINE foo.",
  "DEFINE foo-bar.",
  "DEFINE bar%foo.",
  "define macro>.",
  "DEFINE ?macro?.",
  "DEFINE foo$bar.",
  "DEFINE foo_bar.",
  "DEFINE %_foo-*bar*.",
  "define &xdsfds.",
  "DEFINE /afl/log_init.",
];

statementType(tests, "DEFINE", Statements.Define);