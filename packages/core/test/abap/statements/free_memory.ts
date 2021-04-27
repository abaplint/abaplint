import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "free memory id ls_structure.",
  "free memory id 'ALV_SUBMIT_TO_SPOOL'.",
  "free memory.",
];

statementType(tests, "FREE MEMORY", Statements.FreeMemory);