import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EVENTS foobar.",
  "events CHANGE_PRESSED exporting value(index) type i.",
  "class-events foo exporting value(CONTEXT) type blah.",
];

statementType(tests, "EVENTS", Statements.Events);