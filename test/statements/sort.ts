import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SORT mt_items BY txt ASCENDING AS TEXT.",
  "SORT <fs_table> BY (lt_otab).",
  "SORT rs_component-ctlr_metadata BY def-sdf ASCENDING.",
];

statementType(tests, "SORT", Statements.Sort);