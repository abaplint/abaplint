import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "new-page line-size lv_width.",
  "new-page print off.",
];

statementType(tests, "NEW-PAGE", Statements.NewPage);