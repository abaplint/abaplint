import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FORM foobar DEFINITION.",
  "FORM foo DEFINITION USING bar TYPE c.",
];

statementType(tests, "FORM DEFINITION", Statements.FormDefinition);
