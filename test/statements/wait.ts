import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "WAIT UP TO 1 SECONDS.",
];

statementType(tests, "WAIT", Statements.Wait);