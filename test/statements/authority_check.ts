import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'ACTVT' FIELD '06'.",
  "AUTHORITY-CHECK OBJECT 'S_TCODE' FOR USER iv_user ID 'TCD' FIELD 'ZFOO'.",
];

statementType(tests, "AUTHORITY-CHECK", Statements.AuthorityCheck);