import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "set user-command 'ASDF'.",
];

statementType(tests, "SET USER-COMMAND", Statements.SetUserCommand);