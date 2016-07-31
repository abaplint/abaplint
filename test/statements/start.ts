import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "START-OF-SELECTION.",
];

statementType(tests, "START", Statements.Start);