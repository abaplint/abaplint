import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "GET PARAMETER ID 'GR8' FIELD gv_memid_gr8.",
  "GET PARAMETER ID 'ZID' FIELD ls_foo-bar.",
];

statementType(tests, "GET PARAMETER", Statements.GetParameter);