import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "GET BADI lo_foobar.",
];

statementType(tests, "GET BADI", Statements.GetBadi);