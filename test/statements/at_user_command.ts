import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "AT USER-COMMAND.",
];

statementType(tests, "AT USER-COMMAND", Statements.AtUserCommand);