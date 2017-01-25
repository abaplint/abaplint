import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FETCH NEXT CURSOR lv_cursor INTO TABLE lt_table PACKAGE SIZE lv_size.",
  "FETCH NEXT CURSOR cur INTO ls_record.",
  "FETCH NEXT CURSOR c INTO CORRESPONDING FIELDS OF TABLE lt_table PACKAGE SIZE 10000.",
  "FETCH NEXT CURSOR c APPENDING CORRESPONDING FIELDS OF TABLE lt_tab PACKAGE SIZE iv_size.",
  "FETCH NEXT CURSOR c INTO CORRESPONDING FIELDS OF TABLE lt_result.",
  "FETCH NEXT CURSOR c INTO CORRESPONDING FIELDS OF <wa>.",
];

statementType(tests, "FETCH NEXT", Statements.FetchNext);