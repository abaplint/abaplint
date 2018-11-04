import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "include type t_type.",
  "INCLUDE STRUCTURE zfoo.",
  "include type t_type as something.",
  "INCLUDE TYPE foo AS bar RENAMING WITH SUFFIX 1.",
];

statementType(tests, "INCLUDE TYPE", Statements.IncludeType);