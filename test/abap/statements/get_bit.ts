import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "GET BIT lv_bit OF lv_x INTO lv_c.",
];

statementType(tests, "GET BIT", Statements.GetBit);