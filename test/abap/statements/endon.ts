import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "ENDON.",
];

statementType(tests, "ENDON", Statements.EndOn);