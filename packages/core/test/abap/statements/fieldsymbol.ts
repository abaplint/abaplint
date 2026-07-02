import {statementType, statementVersionOk} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";
import {Release} from "../../../src/version";

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

statementVersionOk([
  {abap: `FIELD-SYMBOLS <fs> TYPE ANY STRUCTURE.`, rel: Release.v916},
], "FIELD-SYMBOLS TYPE ANY STRUCTURE v916", Statements.FieldSymbol);
