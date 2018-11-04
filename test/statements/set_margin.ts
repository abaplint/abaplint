import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "SET MARGIN 1 5.",
];

statementType(tests, "SET MARGIN", Statements.SetMargin);