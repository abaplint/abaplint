import {statementType} from "../_utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "TYPE-POOLS abap.",
];

statementType(tests, "TYPE-POOLS", Statements.TypePools);