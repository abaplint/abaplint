import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TRANSFER lv_file  TO lv_default_file_name.",
  "TRANSFER <rawdata> TO p_back LENGTH bytes.",
  "TRANSFER iv_text TO iv_path NO END OF LINE.",
];

statementType(tests, "TRANSFER", Statements.Transfer);