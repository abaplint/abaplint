import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SCROLL LIST INDEX lv_index TO FIRST PAGE LINE lv_line.",
  "SCROLL LIST INDEX sy-lsind TO PAGE sy-cpage LINE sy-staro.",
];

statementType(tests, "SCROLL LIST", Statements.ScrollList);