import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AT USER-COMMAND.",
];

statementType(tests, "AT USER-COMMAND", Statements.AtUserCommand);