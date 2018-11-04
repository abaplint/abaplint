import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "CLOSE CURSOR cur.",
  "CLOSE CURSOR me->cursor.",
];

statementType(tests, "CLOSE CURSOR", Statements.CloseCursor);