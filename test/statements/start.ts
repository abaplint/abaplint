import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "START-OF-SELECTION.",
];

statementType(tests, "START", Statements.Start);