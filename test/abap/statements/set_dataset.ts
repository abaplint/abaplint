import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET DATASET l_file POSITION l_pos.",
];

statementType(tests, "SET DATASET", Statements.SetDataset);