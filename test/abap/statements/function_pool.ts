import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "FUNCTION-POOL zfoobar MESSAGE-ID ab.",
  "FUNCTION-POOL zfoobar MESSAGE-ID ab LINE-SIZE 100.",
  "FUNCTION-POOL zfoo NO STANDARD PAGE HEADING MESSAGE-ID zabc.",
];

statementType(tests, "FUNCTION-POOL", Statements.FunctionPool);