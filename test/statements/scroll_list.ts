import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SCROLL LIST INDEX lv_index TO FIRST PAGE LINE lv_line.",
];

statementType(tests, "SCROLL LIST", Statements.ScrollList);