import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "RESERVE 10 LINES.",
];

statementType(tests, "RESERVE", Statements.Reserve);