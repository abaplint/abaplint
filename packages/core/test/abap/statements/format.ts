import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FORMAT COLOR 1.",
  "format color 2 intensified off.",
  "format color 3 intensified on.",
  "FORMAT COLOR 4 INTENSIFIED HOTSPOT OFF.",
  "FORMAT COLOR 5 ON.",
  "format color off intensified off inverse off hotspot off input off.",
  "format intensified = 0 color = 0 inverse = 0.",
  "FORMAT FRAMES OFF.",
  "FORMAT COLOR 6 INVERSE.",
  "FORMAT COLOR 3 INTENSIFIED.",
  "FORMAT COLOR 1 OFF.",
  "FORMAT INTENSIFIED OFF.",
  "FORMAT HOTSPOT.",
  "FORMAT COLOR COL_HEADING.",
];

statementType(tests, "FORMAT", Statements.Format);