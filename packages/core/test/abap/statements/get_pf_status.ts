import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "GET PF-STATUS lv_stat.",
  "GET PF-STATUS vv_stat PROGRAM lv_prog EXCLUDING lt_fcode.",
];

statementType(tests, "GET PF-STATUS", Statements.GetPFStatus);