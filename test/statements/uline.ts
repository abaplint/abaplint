import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ULINE.",
];

statementType(tests, "ULINE", Statements.Uline);