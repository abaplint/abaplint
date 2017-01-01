import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FETCH NEXT CURSOR lv_cursor INTO TABLE lt_table PACKAGE SIZE lv_size.",
  "FETCH NEXT CURSOR cur INTO ls_record.",
];

statementType(tests, "FETCH NEXT", Statements.FetchNext);