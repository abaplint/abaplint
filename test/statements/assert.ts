import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ASSERT <lv_field> IS ASSIGNED.",
  "ASSERT CONDITION 0 = 1.",
  "ASSERT FIELDS lx_root->get_text( ) CONDITION 1 = 0.",
];

statementType(tests, "ASSERT", Statements.Assert);