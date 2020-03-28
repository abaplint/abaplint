import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DELETE FROM MEMORY ID 'foobar'.",
  "DELETE FROM SHARED MEMORY indx(ab) ID 'MOO'.",
];

statementType(tests, "DELETE FROM MEMORY", Statements.DeleteMemory);