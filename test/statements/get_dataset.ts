import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "get dataset p_filename position lv_size.",
];

statementType(tests, "GET DATASET", Statements.GetDataset);