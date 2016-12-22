import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ON CHANGE OF structure-field.",
];

statementType(tests, "ON CHANGE", Statements.OnChange);