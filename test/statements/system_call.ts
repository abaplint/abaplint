import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "system-call query class ls_class-clsname.",
];

statementType(tests, "SYSTEM-CALL", Statements.SystemCall);
