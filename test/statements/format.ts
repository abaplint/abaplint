import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FORMAT COLOR lv_col.",
  "format color lv_col intensified off.",
  "format color lv_col intensified on.",
  "format intensified = 0 color = 0 inverse = 0.",
];

statementType(tests, "FORMAT", Statements.Format);