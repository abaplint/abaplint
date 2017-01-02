import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LOG-POINT ID foobar SUBKEY subkey.",
  "LOG-POINT ID foobar.",
];

statementType(tests, "LOG-POINT", Statements.LogPoint);