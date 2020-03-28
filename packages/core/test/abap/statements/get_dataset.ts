import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "get dataset p_filename position lv_size.",
  "GET DATASET me->mv_file ATTRIBUTES ls_attr.",
];

statementType(tests, "GET DATASET", Statements.GetDataset);