import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "ranges l_prot_only for smodilog-prot_only.",
  "RANGES moo FOR foo-bar OCCURS 50.",
  "RANGES $tadir$ FOR tadir-devclass OCCURS 10.",
];

statementType(tests, "RANGES", Statements.Ranges);