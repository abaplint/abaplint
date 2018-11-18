import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "OVERLAY lv_qty WITH '000000000000000000'.",
  "OVERLAY foo WITH bar ONLY '.'.",
];

statementType(tests, "OVERLAY", Statements.Overlay);