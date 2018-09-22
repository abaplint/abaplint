import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ADD-CORRESPONDING foo TO bar.",
];

statementType(tests, "ADD-CORRESPONDING", Statements.AddCorresponding);