import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "INITIALIZATION.",
];

statementType(tests, "INITIALIZATION", Statements.Initialization);