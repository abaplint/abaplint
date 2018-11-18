import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "TRANSFER lv_file  TO lv_default_file_name.",
  "TRANSFER <rawdata> TO p_back LENGTH bytes.",
];

statementType(tests, "TRANSFER", Statements.Transfer);