import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "FETCH NEXT CURSOR lv_cursor INTO TABLE lt_table PACKAGE SIZE lv_size.",
  "FETCH NEXT CURSOR cur INTO ls_record.",
  "FETCH NEXT CURSOR c INTO CORRESPONDING FIELDS OF TABLE lt_table PACKAGE SIZE 10000.",
];

statementType(tests, "FETCH NEXT", Statements.FetchNext);