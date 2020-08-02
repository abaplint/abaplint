import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "field-symbol <foo> type c.",
  "FIELD-SYMBOLS <sdf$> TYPE ty_$.",
  "field-symbols <fs_*bar> type any.",
  "FIELD-SYMBOLS <foo>.",
];

statementType(tests, "FIELD-SYMBOL", Statements.FieldSymbol);
