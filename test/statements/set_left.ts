import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET LEFT SCROLL-BOUNDARY.",
];

statementType(tests, "SET LEFT", Statements.SetLeft);