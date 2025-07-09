import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ranges l_prot_only for smodilog-prot_only.",
  "RANGES moo FOR foo-bar OCCURS 50.",
  "RANGES $tadir$ FOR tadir-devclass OCCURS 10.",
  "RANGES lr_prctr FOR <foo>-prctr.",
  `RANGES r_sdata FOR data-sdata(3).`,
  `RANGES foo-bar FOR bar.`,
];

statementType(tests, "RANGES", Statements.Ranges);