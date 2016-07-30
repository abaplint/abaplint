import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "READ TEXTPOOL lv_cp INTO lt_tpool LANGUAGE mv_language.",
];

statementType(tests, "READ TEXTPOOL", Statements.ReadTextpool);