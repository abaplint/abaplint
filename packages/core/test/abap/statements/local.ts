import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "LOCAL foo.",
  "LOCAL moo[].",
  "LOCAL foo-bar.",
];

statementType(tests, "LOCAL", Statements.Local);