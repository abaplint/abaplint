import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET LOCALE LANGUAGE lang COUNTRY cntry.",
  "SET LOCALE LANGUAGE lang.",
];

statementType(tests, "SET LOCALE", Statements.SetLocale);