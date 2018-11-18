import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "AT USER-COMMAND.",
];

statementType(tests, "AT USER-COMMAND", Statements.AtUserCommand);