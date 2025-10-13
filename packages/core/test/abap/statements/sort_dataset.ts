import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SORT BY foo bar.",
  "SORT.",
  "SORT AS TEXT.",
  `SORT AS TEXT BY foo-bar foo-bar.`,
];

statementType(tests, "SORT dataset", Statements.SortDataset);