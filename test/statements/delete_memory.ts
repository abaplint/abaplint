import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE FROM MEMORY ID 'foobar'.",
];

statementType(tests, "DELETE FROM MEMORY", Statements.DeleteMemory);