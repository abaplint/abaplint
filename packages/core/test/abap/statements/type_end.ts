import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "TYPES END OF gty_icon.",
  "TYPES END OF /foo/bar.",
];

statementType(tests, "TYPE END", Statements.TypeEnd);