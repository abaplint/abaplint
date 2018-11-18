import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "position lv_pos.",
];

statementType(tests, "POSITION", Statements.Position);