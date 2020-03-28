import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "EXPORT DYNPRO H F E M ID KEY.",
];

statementType(tests, "EXPORT DYNPRO", Statements.ExportDynpro);