import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "UNPACK lv_dt TO lv_date.",
];

statementType(tests, "UNPACK", Statements.Unpack);