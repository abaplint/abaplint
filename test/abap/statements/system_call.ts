import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "system-call query class ls_class-clsname.",
];

statementType(tests, "SYSTEM-CALL", Statements.SystemCall);
