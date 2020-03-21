import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "top-of-page.",
  "top-of-page during line-selection.",
];

statementType(tests, "TOP-OF-PAGE", Statements.TopOfPage);