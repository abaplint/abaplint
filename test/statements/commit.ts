import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "COMMIT WORK.",
  "COMMIT WORK AND WAIT.",
  "commit connection (lv_name).",
  "commit connection lv_con.",
];

statementType(tests, "COMMIT", Statements.Commit);