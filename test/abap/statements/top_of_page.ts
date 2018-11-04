import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

let tests = [
  "top-of-page.",
  "top-of-page during line-selection.",
];

statementType(tests, "TOP-OF-PAGE", Statements.TopOfPage);