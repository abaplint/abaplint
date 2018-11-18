import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "END-OF-PAGE.",
];

statementType(tests, "END-OF-PAGE", Statements.EndOfPage);