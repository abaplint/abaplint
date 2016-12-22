import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET UPDATE TASK LOCAL.",
];

statementType(tests, "SET UPDATE TASK", Statements.SetUpdateTask);