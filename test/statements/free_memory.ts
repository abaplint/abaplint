import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "free memory id ls_structure.",
  "free memory id 'ALV_SUBMIT_TO_SPOOL'.",
];

statementType(tests, "FREE MEMORY", Statements.FreeMemory);