import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "field-symbol <foo> type c.",
  "FIELD-SYMBOLS <foo>.",
];

statementType(tests, "FIELD-SYMBOL", Statements.FieldSymbol);
