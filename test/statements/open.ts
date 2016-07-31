import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "OPEN DATASET lv_default_file_name FOR OUTPUT IN BINARY MODE.",
  "OPEN DATASET filename FOR INPUT IN BINARY MODE.",
];

statementType(tests, "OPEN", Statements.Open);