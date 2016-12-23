import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "RESERVE 10 LINES.",
];

statementType(tests, "RESERVE", Statements.Reserve);