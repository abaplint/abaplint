import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "GENERATE DYNPRO H F E M ID key MESSAGE field1 LINE field2 WORD field3.",
];

statementType(tests, "GENERATE DYNPRO", Statements.GenerateDynpro);