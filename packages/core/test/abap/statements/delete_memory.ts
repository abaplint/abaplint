import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DELETE FROM MEMORY ID 'foobar'.",
  "DELETE FROM SHARED MEMORY indx(ab) ID 'MOO'.",
  "DELETE FROM SHARED MEMORY indx(aa) CLIENT '100' ID 'foobar'.",
];

statementType(tests, "DELETE FROM MEMORY", Statements.DeleteMemory);