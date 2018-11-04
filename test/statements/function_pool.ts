import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "FUNCTION-POOL ZFOOBAR MESSAGE-ID SV.",
];

statementType(tests, "FUNCTION-POOL", Statements.FunctionPool);