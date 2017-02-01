import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET DATASET l_file POSITION l_pos.",
];

statementType(tests, "SET DATASET", Statements.SetDataset);