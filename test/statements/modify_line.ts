import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "MODIFY LINE sy-index FIELD VALUE lv_val FROM gc_false.",
  "MODIFY CURRENT LINE FIELD VALUE mark FROM space.",
  "modify line lineno.",
  "modify line 2.",
  "MODIFY LINE 2 INDEX 0 FIELD VALUE val.",
];

statementType(tests, "MODIFY LINE", Statements.ModifyLine);