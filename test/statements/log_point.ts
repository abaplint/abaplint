import {statementType} from "../utils";
import * as Statements from "../../src/statements/";

let tests = [
  "LOG-POINT ID foobar SUBKEY subkey.",
  "LOG-POINT ID __foobar__ SUBKEY subkey.",
  "LOG-POINT ID foobar.",
  "LOG-POINT ID foobar SUBKEY 'sub' FIELDS 'foobar'.",
  "LOG-POINT ID foobar SUBKEY 'sub' FIELDS 'foo' 'bar'.",
];

statementType(tests, "LOG-POINT", Statements.LogPoint);