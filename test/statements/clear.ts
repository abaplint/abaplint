import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CLEAR foobar.",
  "CLEAR cg_value+sy-fdpos.",
  "CLEAR fontx-color WITH 'X'.",
  "CLEAR me->zif_foo~field.",
  "clear ld_data_changes with abap_true in character mode.",
  "CLEAR ct_source[].",
];

statementType(tests, "CLEAR", Statements.Clear);