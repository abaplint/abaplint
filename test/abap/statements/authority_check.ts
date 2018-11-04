import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'ACTVT' FIELD '06'.",
  "AUTHORITY-CHECK OBJECT 'S_TCODE' FOR USER iv_user ID 'TCD' FIELD 'ZFOO'.",
  "AUTHORITY-CHECK OBJECT 'S_USER_SAS' ID 'ACTVT' FIELD i_act ID 'SUBSYSTEM' DUMMY.",
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'FOO' FIELD 'BAR' ID 'ACTVT' FIELD '06'.",
];

statementType(tests, "AUTHORITY-CHECK", Statements.AuthorityCheck);