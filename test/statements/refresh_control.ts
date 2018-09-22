import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "REFRESH CONTROL 'TC' FROM SCREEN lv_dyn.",
];

statementType(tests, "REFRESH CONTROL", Statements.RefreshControl);