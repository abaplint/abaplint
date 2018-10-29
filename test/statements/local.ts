import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "LOCAL foo.",
  "LOCAL moo[].",
  "LOCAL foo-bar.",
];

statementType(tests, "LOCAL", Statements.Local);