import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "break-point.",
  "break-point id foo.",
  "BREAK-POINT AT NEXT APPLICATION STATEMENT.",
  "break username.",
  "BREAK-POINT lv_logtxt.",
];

statementType(tests, "BREAK-POINT", Statements.Break);