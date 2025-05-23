import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TRANSFER lv_file  TO lv_default_file_name.",
  "TRANSFER <rawdata> TO p_back LENGTH bytes.",
  "TRANSFER l_data TO 'foobar.txt'.",
  "TRANSFER iv_text TO iv_path NO END OF LINE.",
  `TRANSFER foo TO bar.`,
];

statementType(tests, "TRANSFER", Statements.Transfer);