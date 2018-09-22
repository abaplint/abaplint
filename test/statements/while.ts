import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "WHILE strlen( rv_bits ) < iv_length.",
  "WHILE NOT lv_hex IS INITIAL.",
];

statementType(tests, "WHILE", Statements.While);