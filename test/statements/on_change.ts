import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ON CHANGE OF structure-field.",
];

statementType(tests, "ON CHANGE", Statements.OnChange);