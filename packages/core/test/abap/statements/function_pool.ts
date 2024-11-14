import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FUNCTION-POOL zfoobar MESSAGE-ID ab.",
  "FUNCTION-POOL zfoobar MESSAGE-ID ab LINE-SIZE 100.",
  "FUNCTION-POOL zfoo NO STANDARD PAGE HEADING MESSAGE-ID zabc.",
  "FUNCTION-POOL zfoo NO STANDARD PAGE HEADING MESSAGE-ID Y>.",
  "FUNCTION-POOL Z--R NO STANDARD PAGE HEADING MESSAGE-ID zaaa.",
  "FUNCTION-POOL YFOO MESSAGE-ID Y-.",
];

statementType(tests, "FUNCTION-POOL", Statements.FunctionPool);