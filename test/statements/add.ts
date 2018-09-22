import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "add 2 to lv_foo.",
  "add zcl_class=>c_diagonal to lo_foo->mode.",
];

statementType(tests, "ADD", Statements.Add);