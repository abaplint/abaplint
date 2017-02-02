import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET PF-STATUS lv_stat.",
];

statementType(tests, "GET PF-STATUS", Statements.GetPFStatus);