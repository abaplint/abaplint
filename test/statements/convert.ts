import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CONVERT TIME STAMP lv_stamp TIME ZONE tz INTO DATE dat TIME tim DAYLIGHT SAVING TIME dst.",
  "CONVERT TIME STAMP obj->stru~created TIME ZONE sy-zonlo INTO DATE lv_date TIME lv_time.",
];

statementType(tests, "CONVERT", Statements.Convert);