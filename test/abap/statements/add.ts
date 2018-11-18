import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/statements/";

const tests = [
  "add 2 to lv_foo.",
  "add zcl_class=>c_diagonal to lo_foo->mode.",
];

statementType(tests, "ADD", Statements.Add);