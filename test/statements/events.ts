import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EVENTS foobar.",
  "events CHANGE_PRESSED exporting value(index) type i.",
];

statementType(tests, "EVENTS", Statements.Events);