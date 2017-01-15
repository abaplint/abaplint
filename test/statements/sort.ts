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

  "SORT data BY\n" +
  "  (foo-f01)\n" +
  "  (foo-f01d) DESCENDING\n" +
  "  (foo-f02)\n" +
  "  (foo-f02d) DESCENDING\n" +
  "  (foo-f03)\n" +
  "  (foo-f03d) DESCENDING\n" +
  "  (foo-f04)\n" +
  "  (foo-f04d) DESCENDING\n" +
  "  (foo-f05)\n" +
  "  (foo-f05d) DESCENDING\n" +
  "  (foo-f06)\n" +
  "  (foo-f06d) DESCENDING\n" +
  "  (foo-f07)\n" +
  "  (foo-f07d) DESCENDING\n" +
  "  (foo-f08)\n" +
  "  (foo-f08d) DESCENDING\n" +
  "  (foo-f09)\n" +
  "  (foo-f09d) DESCENDING\n" +
  "  (foo-f10)\n" +
  "  (foo-f10d) DESCENDING\n" +
  "  (foo-f11)\n" +
  "  (foo-f11d) DESCENDING\n" +
  "  (foo-f12)\n" +
  "  (foo-f12d) DESCENDING\n" +
  "  (foo-f13)\n" +
  "  (foo-f13d) DESCENDING\n" +
  "  (foo-f14)\n" +
  "  (foo-f14d) DESCENDING\n" +
  "  (foo-f15)\n" +
  "  (foo-f15d) DESCENDING\n" +
  "  (foo-f16)\n" +
  "  (foo-f16d) DESCENDING\n" +
  "  (foo-f17)\n" +
  "  (foo-f17d) DESCENDING\n" +
  "  (foo-f18)\n" +
  "  (foo-f18d) DESCENDING\n" +
  "  (foo-f19)\n" +
  "  (foo-f19d) DESCENDING\n" +
  "  (foo-f20)\n" +
  "  (foo-f20d) DESCENDING.",
];

statementType(tests, "SORT", Statements.Sort);