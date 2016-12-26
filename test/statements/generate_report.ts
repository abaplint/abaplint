import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "generate report lv_name.",
];

statementType(tests, "GENERATE REPORT", Statements.GenerateReport);