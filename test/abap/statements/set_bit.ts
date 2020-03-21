import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET BIT ( lv_offset MOD 8 ) + 1 OF lv_x.",
  "SET BIT lv_prev_pos OF r_pwd_hash TO lv_bit.",
];

statementType(tests, "SET BIT", Statements.SetBit);