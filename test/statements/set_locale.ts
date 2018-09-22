import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET LOCALE LANGUAGE lang COUNTRY cntry.",
  "SET LOCALE LANGUAGE lang.",
  "SET LOCALE LANGUAGE lv_lang COUNTRY lv_country MODIFIER lv_mod.",
];

statementType(tests, "SET LOCALE", Statements.SetLocale);