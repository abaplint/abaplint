import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "HIDE gv_field.",
];

statementType(tests, "HIDE", Statements.Hide);