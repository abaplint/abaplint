import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "FIELD-SYMBOLS <sdf$> TYPE ty_$.",
  "field-symbols <fs_*bar> type any.",
  "FIELD-SYMBOLS <foo>.",
  "FIELD-SYMBOLS <bar> STRUCTURE usr02 DEFAULT usr02.",
  `FIELD-SYMBOLS <moo?>.`,
  `FIELD-SYMBOLS <?moo>.`,
  `FIELD-SYMBOLS <mo?o>.`,
];

statementType(tests, "FIELD-SYMBOL", Statements.FieldSymbol);
