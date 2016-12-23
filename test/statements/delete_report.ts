import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "DELETE REPORT zfoobar.",
];

statementType(tests, "DELETE REPORT", Statements.DeleteReport);