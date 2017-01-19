import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "PACK foo TO bar.",
];

statementType(tests, "PACK", Statements.Pack);