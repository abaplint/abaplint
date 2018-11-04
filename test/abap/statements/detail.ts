import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DETAIL.",
];

statementType(tests, "DETAIL", Statements.Detail);