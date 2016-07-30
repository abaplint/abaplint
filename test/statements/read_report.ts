import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "READ REPORT ls_include INTO rt_source STATE 'A'.",
  "READ REPORT is_level-name INTO rt_code.",
];

statementType(tests, "READ REPORT", Statements.ReadReport);