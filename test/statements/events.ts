import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "EVENTS foobar.",
];

statementType(tests, "EVENTS", Statements.Events);