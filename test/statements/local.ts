import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LOCAL foo.",
  "LOCAL foo-bar.",
];

statementType(tests, "LOCAL", Statements.Local);