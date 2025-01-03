import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SCROLL LIST INDEX lv_index TO FIRST PAGE LINE lv_line.",
  "SCROLL LIST INDEX sy-lsind TO PAGE sy-cpage LINE sy-staro.",
  "scroll list to last page line lv_line.",
  "scroll list to first page.",
  "scroll list backward.",
  "scroll list forward.",
  "SCROLL LIST TO FIRST PAGE INDEX SY-LSIND.",
  "SCROLL LIST INDEX sy-lsind TO COLUMN sy-staco.",
  "SCROLL LIST RIGHT INDEX zsdfsd.",
  "SCROLL LIST INDEX sy-lsind RIGHT BY n PLACES.",
  "SCROLL LIST FORWARD 1 PAGES.",
  "SCROLL LIST BACKWARD 1 PAGES.",
];

statementType(tests, "SCROLL LIST", Statements.ScrollList);