import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SCROLL LIST INDEX lv_index TO FIRST PAGE LINE lv_line.",
  "SCROLL LIST INDEX sy-lsind TO PAGE sy-cpage LINE sy-staro.",
  "scroll list to last page line lv_line.",
  "scroll list to first page.",
  "scroll list backward.",
];

statementType(tests, "SCROLL LIST", Statements.ScrollList);