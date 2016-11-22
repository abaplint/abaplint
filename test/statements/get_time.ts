import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET TIME STAMP FIELD lv_timestamp.",
  "GET TIME.",
  "GET TIME FIELD lv_time.",
];

statementType(tests, "GET TIME", Statements.GetTime);