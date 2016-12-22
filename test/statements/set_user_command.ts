import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "set user-command 'ASDF'.",
];

statementType(tests, "SET USER-COMMAND", Statements.SetUserCommand);