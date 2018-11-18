import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "ENDON.",
];

statementType(tests, "ENDON", Statements.EndOn);