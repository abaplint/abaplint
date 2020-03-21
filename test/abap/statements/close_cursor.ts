import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "CLOSE CURSOR cur.",
  "CLOSE CURSOR me->cursor.",
  "CLOSE CURSOR @lv_cursor.",
];

statementType(tests, "CLOSE CURSOR", Statements.CloseCursor);