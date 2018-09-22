import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "OVERLAY lv_qty WITH '000000000000000000'.",
  "OVERLAY foo WITH bar ONLY '.'.",
];

statementType(tests, "OVERLAY", Statements.Overlay);