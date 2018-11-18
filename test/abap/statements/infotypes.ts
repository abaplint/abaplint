import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "INFOTYPES 1000.",
];

statementType(tests, "INFOTYPES", Statements.Infotypes);