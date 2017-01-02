import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ADD-CORRESPONDING foo TO bar.",
];

statementType(tests, "ADD-CORRESPONDING", Statements.AddCorresponding);