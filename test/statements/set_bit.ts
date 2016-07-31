import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "SET BIT ( lv_offset MOD 8 ) + 1 OF lv_x.",
];

statementType(tests, "SET BIT", Statements.SetBit);