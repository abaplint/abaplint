import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  `AT PF1.`,
  `AT PF01.`,
  `AT PF24.`,
];

statementType(tests, "AT PF", Statements.AtPF);