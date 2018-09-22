import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CLOSE DATASET lv_default_file_name.",
  "CLOSE DATASET me->mv_file.",
];

statementType(tests, "CLOSE", Statements.CloseDataset);