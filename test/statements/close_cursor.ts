import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "CLOSE CURSOR cur.",
  "CLOSE CURSOR me->cursor.",
];

statementType(tests, "CLOSE CURSOR", Statements.CloseCursor);