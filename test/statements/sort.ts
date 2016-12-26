import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SORT mt_items BY txt ASCENDING AS TEXT.",
  "SORT <fs_table> BY (lt_otab).",
  "SORT lt_weight DESCENDING.",
  "SORT lt_list BY <fs>.",
  "sort lt_table by (l_field) descending.",
  "SORT gt_header STABLE BY avg ASCENDING.",
  "SORT rs_component-ctlr_metadata BY def-sdf ASCENDING.",
  "SORT lt_list ASCENDING BY id ASCENDING.",
  "SORT lt_text AS TEXT.",
];

statementType(tests, "SORT", Statements.Sort);