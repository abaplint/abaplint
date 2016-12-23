import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "ENDON.",
];

statementType(tests, "ENDON", Statements.EndOn);