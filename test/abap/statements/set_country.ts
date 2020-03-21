import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "set country 'DE'.",
];

statementType(tests, "SET COUNTRY", Statements.SetCountry);