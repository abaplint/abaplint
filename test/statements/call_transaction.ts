import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CALL TRANSACTION 'FOO'.",
  "CALL TRANSACTION 'FOO' AND SKIP FIRST SCREEN.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK AND SKIP FIRST SCREEN.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK USING lt_bdcdata MODE lv_mode.",
  "CALL TRANSACTION 'FOO' WITH AUTHORITY-CHECK USING bdcdata OPTIONS FROM opt.",
  "CALL TRANSACTION 'FOO' USING BDCDATA MODE 'E' UPDATE 'A'.",
];

statementType(tests, "CALL TRANSACTION", Statements.CallTransaction);