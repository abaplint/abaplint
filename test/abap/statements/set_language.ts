import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "SET LANGUAGE SY-LANGU.",
];

statementType(tests, "SET LANGUAGE", Statements.SetLanguage);