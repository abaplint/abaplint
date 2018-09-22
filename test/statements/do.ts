import {statementType} from "../utils";
import * as Statements from "../../src/abap/statements/";

let tests = [
  "DO var TIMES.",
  "DO 10 TIMES.",
  "DO 10 TIMES VARYING foo FROM from NEXT next.",
  "DO 10 TIMES VARYING field FROM foo NEXT bar.",
  "DO VARYING var FROM foo NEXT bar.",
  "DO.",
  "DO 16 TIMES VARYING field1 FROM foo NEXT bar VARYING field2 FROM foo NEXT bar.",
];

statementType(tests, "DO", Statements.Do);