import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GET LOCALE LANGUAGE lang COUNTRY cntry MODIFIER mod.",
];

statementType(tests, "GET LOCALE", Statements.GetLocale);