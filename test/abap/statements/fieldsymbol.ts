import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "field-symbol <foo> type c.",
];

statementType(tests, "FIELD-SYMBOL", Statements.FieldSymbol);
