import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "READ LINE lv_line LINE VALUE INTO lv_text.",
  "read line sy-index field value lv_val into lv_target.",
  "READ LINE sy-index FIELD VALUE mark.",
  "READ LINE sy-index.",
];

statementType(tests, "READ LINE", Statements.ReadLine);