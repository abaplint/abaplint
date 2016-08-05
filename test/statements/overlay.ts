import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "OVERLAY lv_qty WITH '000000000000000000'.",
];

statementType(tests, "OVERLAY", Statements.Overlay);