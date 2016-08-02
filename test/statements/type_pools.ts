import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "TYPE-POOLS abap.",
];

statementType(tests, "TYPE-POOLS", Statements.TypePools);