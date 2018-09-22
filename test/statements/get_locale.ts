import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "GET LOCALE LANGUAGE lang COUNTRY cntry MODIFIER mod.",
];

statementType(tests, "GET LOCALE", Statements.GetLocale);