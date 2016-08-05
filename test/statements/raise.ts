import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "raise exception type zcx_root.",
  "RAISE EXCEPTION lx_root.",
  "RAISE EXCEPTION TYPE lcx_exception EXPORTING iv_text = lv_text.",
];

statementType(tests, "RAISE", Statements.Raise);