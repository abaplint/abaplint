import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "new-page line-size lv_width.",
  "NEW-PAGE NO-TITLE NO-HEADING.",
  "NEW-PAGE WITH-TITLE.",
  "new-page print off.",
];

statementType(tests, "NEW-PAGE", Statements.NewPage);