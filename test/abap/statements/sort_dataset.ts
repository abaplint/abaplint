import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SORT BY foo bar.",
  "SORT.",
];

statementType(tests, "SORT dataset", Statements.SortDataset);