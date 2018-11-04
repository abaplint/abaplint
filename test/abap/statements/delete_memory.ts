import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "DELETE FROM MEMORY ID 'foobar'.",
];

statementType(tests, "DELETE FROM MEMORY", Statements.DeleteMemory);