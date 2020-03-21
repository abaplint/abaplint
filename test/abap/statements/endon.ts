import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "ENDON.",
];

statementType(tests, "ENDON", Statements.EndOn);