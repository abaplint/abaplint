import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET TIME STAMP FIELD lv_timestamp.",
];

statementType(tests, "GET TIME STAMP", Statements.GetTimeStamp);