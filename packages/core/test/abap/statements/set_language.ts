import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SET LANGUAGE SY-LANGU.",
];

statementType(tests, "SET LANGUAGE", Statements.SetLanguage);