import {statementType} from "../_utils";
import * as Statements from "../../../src/abap/2_statements/statements";

const tests = [
  "LOG-POINT ID foobar SUBKEY subkey.",
  "LOG-POINT ID __foobar__ SUBKEY subkey.",
  "LOG-POINT ID foobar.",
  "LOG-POINT ID foobar SUBKEY 'sub' FIELDS 'foobar'.",
  "LOG-POINT ID foobar SUBKEY 'sub' FIELDS 'foo' 'bar'.",
  "LOG-POINT ID /foo/bar FIELDS sy-uname.",
];

statementType(tests, "LOG-POINT", Statements.LogPoint);