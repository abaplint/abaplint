import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "field-symbol <foo> type c.",
];

statementType(tests, "FIELD-SYMBOL", Statements.FieldSymbol);
