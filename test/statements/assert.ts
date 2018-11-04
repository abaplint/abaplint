import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ASSERT <lv_field> IS ASSIGNED.",
  "ASSERT CONDITION 0 = 1.",
  "ASSERT ID user_mgnt_law CONDITION lv_in_central EQ 'X'.",
  "ASSERT ID __foo__ CONDITION lv_in_central EQ 'X'.",
  "ASSERT FIELDS lx_root->get_text( ) CONDITION 1 = 0.",
  "ASSERT ID bar SUBKEY 'FOO' FIELDS field CONDITION sy-subrc EQ 0.",
  "ASSERT ID /foo/bar CONDITION sy-subrc = 0.",
];

statementType(tests, "ASSERT", Statements.Assert);