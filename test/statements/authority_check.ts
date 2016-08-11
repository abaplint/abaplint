import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'ACTVT' FIELD '06'.",
  "AUTHORITY-CHECK OBJECT 'S_TCODE' FOR USER iv_user ID 'TCD' FIELD 'ZFOO'.",
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'FOO' FIELD 'BAR' ID 'ACTVT' FIELD '06'.",
];

statementType(tests, "AUTHORITY-CHECK", Statements.AuthorityCheck);