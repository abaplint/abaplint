import {statementType, statementVersionFail} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Version} from "../../../src";

const tests = [
  "CLEAR foobar.",
  "CLEAR cg_value+sy-fdpos.",
  "CLEAR fontx-color WITH 'X'.",
  "CLEAR me->zif_foo~field.",
  "clear ld_data_changes with abap_true in character mode.",
  "CLEAR ct_source[].",
  "clear borderx with 'X'.",
  "CLEAR value+l_pos(*).",
  "CLEAR <l_byte> WITH byte IN BYTE MODE.",
  "CLEAR $foo$.",
];

statementType(tests, "CLEAR", Statements.Clear);

const versionsFail = [
  {abap: "CLEAR lr_attri->r_ref->*.", ver: Version.v750},
];

statementVersionFail(versionsFail, "CALL");
