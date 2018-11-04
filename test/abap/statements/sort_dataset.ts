import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SORT BY foo bar.",
  "SORT.",
];

statementType(tests, "SORT dataset", Statements.SortDataset);