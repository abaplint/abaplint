import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "ENDPROVIDE.",
];

statementType(tests, "ENDPROVIDE", Statements.EndProvide);