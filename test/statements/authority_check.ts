import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "AUTHORITY-CHECK OBJECT 'ZFOOBAR' ID 'ACTVT' FIELD '06'.",
];

statementType(tests, "AUTHORITY-CHECK", Statements.AuthorityCheck);