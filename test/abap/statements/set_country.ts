import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "set country 'DE'.",
];

statementType(tests, "SET COUNTRY", Statements.SetCountry);