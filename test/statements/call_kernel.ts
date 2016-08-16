import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL 'SYST_LOGOFF'.",
];

statementType(tests, "CALL kernel", Statements.CallKernel);