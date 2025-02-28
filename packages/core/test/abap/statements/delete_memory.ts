import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "DELETE FROM MEMORY ID 'foobar'.",
  "DELETE FROM SHARED MEMORY indx(ab) ID 'MOO'.",
  "DELETE FROM SHARED MEMORY indx(aa) CLIENT '100' ID 'foobar'.",
  "DELETE FROM SHARED BUFFER indx(ZZ) ID 'FOO'.",
  `DELETE FROM SHARED BUFFER indx(00) ID gc_foo.`,
  `DELETE FROM SHARED BUFFER moos(%L) ID ID.`,
];

statementType(tests, "DELETE FROM MEMORY", Statements.DeleteMemory);