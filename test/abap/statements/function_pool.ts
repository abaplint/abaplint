import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "FUNCTION-POOL zfoobar MESSAGE-ID ab.",
  "FUNCTION-POOL zfoobar MESSAGE-ID ab LINE-SIZE 100.",
];

statementType(tests, "FUNCTION-POOL", Statements.FunctionPool);