import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "INITIALIZATION.",
];

statementType(tests, "INITIALIZATION", Statements.Initialization);