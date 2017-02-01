import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "OPEN CURSOR WITH HOLD l_db_cursor FOR SELECT mandt objct FROM usr12 WHERE mandt = lv_mandt.",
  "open cursor l_cursor for select * from ztab.",
];

statementType(tests, "OPEN CURSOR", Statements.OpenCursor);