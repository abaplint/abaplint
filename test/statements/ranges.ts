import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ranges l_prot_only for smodilog-prot_only.",
  "RANGES moo FOR foo-bar OCCURS 50.",
];

statementType(tests, "RANGES", Statements.Ranges);