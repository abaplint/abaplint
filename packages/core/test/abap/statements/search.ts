import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "SEARCH foo-bar FOR '/' STARTING AT 2.",
  "search foo for bar in byte mode.",
  "search foo for bar in character mode starting at lv_start.",
  "search foo for 'a' starting at 1 ending at 2.",
  "SEARCH foo FOR tag STARTING AT lv_start IN BYTE MODE.",
  "SEARCH foo-bar FOR 'val' AND MARK.",
];

statementType(tests, "SEARCH", Statements.Search);