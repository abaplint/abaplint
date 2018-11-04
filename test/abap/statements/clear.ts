import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "CLEAR foobar.",
  "CLEAR cg_value+sy-fdpos.",
  "CLEAR fontx-color WITH 'X'.",
  "CLEAR me->zif_foo~field.",
  "clear ld_data_changes with abap_true in character mode.",
  "CLEAR ct_source[].",
  "CLEAR value+l_pos(*).",
  "CLEAR <l_byte> WITH byte IN BYTE MODE.",
  "CLEAR $foo$.",
];

statementType(tests, "CLEAR", Statements.Clear);