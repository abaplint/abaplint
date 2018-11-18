import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "CLOSE DATASET lv_default_file_name.",
  "CLOSE DATASET me->mv_file.",
  "close dataset 'file.xml'.",
];

statementType(tests, "CLOSE", Statements.CloseDataset);