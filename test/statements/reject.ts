import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "REJECT.",
  "REJECT 'BKPF'.",
];

statementType(tests, "REJECT", Statements.Reject);