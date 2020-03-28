import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "COMMIT WORK.",
  "COMMIT WORK AND WAIT.",
  "commit connection (lv_name).",
  "commit connection lv_con.",
];

statementType(tests, "COMMIT", Statements.Commit);