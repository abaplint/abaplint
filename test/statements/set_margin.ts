import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET MARGIN 1 5.",
];

statementType(tests, "SET MARGIN", Statements.SetMargin);