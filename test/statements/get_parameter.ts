import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET PARAMETER ID 'GR8' FIELD gv_memid_gr8.",
];

statementType(tests, "GET PARAMETER", Statements.GetParameter);