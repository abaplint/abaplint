import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TRANSFER lv_file  TO lv_default_file_name.",
];

statementType(tests, "TRANSFER", Statements.Transfer);