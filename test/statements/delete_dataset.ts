import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DELETE DATASET l_psepath.",
];

statementType(tests, "DELETE DATASET", Statements.DeleteDataset);